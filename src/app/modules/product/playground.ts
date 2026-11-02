// Drop-in replacement for your old createProduct.
// Adjust these imports to your project (names/paths are guesses based on your old code).

import { Prisma, Product } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
    CreateProductPayload,
    UpdateProductPayload,
} from "./playgound.validation";
import {
    ImageRow,
    prepareVariants,
    resolveImageAttribute,
    splitImageFiles,
    toAttrs,
    UPLOAD_CONCURRENCY,
    uploadImageJobs,
    UploadJob,
    VARIANT_IMAGE_PREFIX,
} from "./product.helpers";

// Use the same imports as your getAllBrand (QueryBuilder, IQueryParams, prisma, Prisma, Product).

/* ------------------------------------------------------------------ */
/* Constants (put them next to brandSearchableFields)                 */
/* ------------------------------------------------------------------ */

// "variants.sku" works because the builder wraps 2-part search paths in `some` (to-many).
// Don't add "brand.name" / "category.name": brand and category are to-one relations,
// and `some` on them makes Prisma throw.
export const productSearchableFields = ["name", "slug", "variants.sku"];

// Keep this list explicit. An EMPTY list means "allow every field" in your builder.
// Dotted keys are not wrapped in `some`, so only to-one relations belong here.
// Price and attribute filters are handled in the service (they live on variants).
export const productFilterableFields = [
    "categoryId",
    "brandId",
    "status",
    "category.slug",
    "brand.slug",
];

// the builder doesn't whitelist sortBy, so an unknown field would be a Prisma error
export const productSortableFields = ["createdAt", "updatedAt", "name"];

/* ------------------------------------------------------------------ */
/* Service                                                            */
/* ------------------------------------------------------------------ */

type ProductListRow = Product & {
    images: { url: string }[];
    variants: {
        id: string;
        price: unknown; // Prisma Decimal
        compareAtPrice: unknown;
        stockQuantity: number;
    }[];
    brand: { id: string; name: string; slug: string } | null;
    category: { id: string; name: string; slug: string };
};

const toNumber = (value: unknown) => {
    const n = Number(value);
    return value !== undefined && value !== "" && Number.isFinite(n)
        ? n
        : undefined;
};

// GET /products?searchTerm=shirt&category.slug=shirt&minPrice=300&maxPrice=800
//              &attributes[color]=Black&attributes[size]=M&page=1&limit=12&sortBy=name&sortOrder=asc
export const getAllProductsServ = async (
    query: IQueryParams,
    options: { publicOnly?: boolean } = {},
) => {
    const sortBy =
        typeof query.sortBy === "string" &&
        productSortableFields.includes(query.sortBy)
            ? query.sortBy
            : "createdAt";

    // variant-level filters: all of them must be matched by the SAME variant
    const minPrice = toNumber(query.minPrice);
    const maxPrice = toNumber(query.maxPrice);

    const rawAttributes = query.attributes as unknown;
    const attributeFilters =
        typeof rawAttributes === "object" &&
        rawAttributes !== null &&
        !Array.isArray(rawAttributes)
            ? Object.entries(rawAttributes as Record<string, unknown>).filter(
                  (entry): entry is [string, string] =>
                      typeof entry[1] === "string" && entry[1] !== "",
              )
            : [];

    const needsVariantFilter =
        minPrice !== undefined ||
        maxPrice !== undefined ||
        attributeFilters.length > 0;

    const variantFilter: Prisma.ProductVariantWhereInput = {
        isDeleted: false,
        ...(minPrice !== undefined || maxPrice !== undefined
            ? {
                  price: {
                      ...(minPrice !== undefined ? { gte: minPrice } : {}),
                      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
                  },
              }
            : {}),
        ...(attributeFilters.length > 0
            ? {
                  AND: attributeFilters.map(([key, value]) => ({
                      attributes: { path: [key], equals: value },
                  })),
              }
            : {}),
    };

    const queryBuilder = new QueryBuilder<
        Product,
        Prisma.ProductWhereInput,
        Prisma.ProductInclude
    >(
        prisma.product,
        { ...query, sortBy },
        {
            searchableFields: productSearchableFields,
            filterableFields: productFilterableFields,
        },
    );

    const result = await queryBuilder
        .search()
        .filter()
        // where() runs after filter(), so these always win over anything in the URL
        .where({
            isDeleted: false,
            ...(options.publicOnly && { status: "ACTIVE" as const }),
            ...(needsVariantFilter && { variants: { some: variantFilter } }),
        })
        .include({
            images: {
                where: { isDeleted: false },
                orderBy: { position: "asc" },
                take: 1, // cover image
                select: { url: true },
            },
            variants: {
                where: { isDeleted: false },
                orderBy: { position: "asc" },
                select: {
                    id: true,
                    price: true,
                    compareAtPrice: true,
                    stockQuantity: true,
                },
            },
            brand: { select: { id: true, name: true, slug: true } },
            category: { select: { id: true, name: true, slug: true } },
        })
        .paginate()
        .sort()
        // no .fields() here: the card shape below is built from images + variants
        .execute();

    const products = result.data as unknown as ProductListRow[];

    return {
        data: products.map((product) => {
            const prices = product.variants.map((v) => Number(v.price));
            const defaultVariant =
                product.variants.find((v) => v.stockQuantity > 0) ??
                product.variants[0];

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                status: product.status,
                createdAt: product.createdAt,
                brand: product.brand,
                category: product.category,
                image: product.images[0]?.url ?? null,
                minPrice: prices.length ? Math.min(...prices) : null,
                maxPrice: prices.length ? Math.max(...prices) : null,
                inStock: product.variants.some((v) => v.stockQuantity > 0),
                isSingleVariant: product.variants.length === 1,
                variantCount: product.variants.length,
                defaultVariantId: defaultVariant?.id ?? null,
            };
        }),
        meta: result.meta,
    };
};

// storefront:  getAllProducts(req.query, { publicOnly: true })
// admin panel: getAllProducts(req.query)

/* ------------------------------------------------------------------ */
/* createProduct                                                      */
/* ------------------------------------------------------------------ */

export const createProductServ = async (
    payload: CreateProductPayload,
    files: Record<string, UploadFile[]> = {},
) => {
    const { name, slug, description, categoryId, brandId, status } = payload;

    const uploadedPublicIds: string[] = [];

    try {
        // ------------------------------------------
        // 1. Format slug + check duplicate product
        // ------------------------------------------

        const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

        const existingProduct = await prisma.product.findFirst({
            where: { slug: formattedSlug },
        });

        if (existingProduct) {
            if (existingProduct.isDeleted) {
                throw new AppError(
                    409,
                    "A deleted product with this slug already exists. Please restore it instead.",
                );
            }
            throw new AppError(409, "A product with this slug already exists.");
        }

        // ------------------------------------------
        // 2. Check category + brand
        // ------------------------------------------

        const category = await prisma.category.findFirst({
            where: { id: categoryId, isDeleted: false },
        });
        if (!category) throw new AppError(404, "Category not found");

        if (brandId) {
            const brand = await prisma.brand.findFirst({
                where: { id: brandId, isDeleted: false },
            });
            if (!brand) throw new AppError(404, "Brand not found");
        }

        // ------------------------------------------
        // 3. Validate variants + check SKUs in DB
        // ------------------------------------------

        const variants = prepareVariants(payload.variants);

        const existingVariant = await prisma.productVariant.findFirst({
            where: { sku: { in: variants.map((v) => v.sku) } },
        });
        if (existingVariant) {
            throw new AppError(
                409,
                `Variant with SKU "${existingVariant.sku}" already exists.`,
            );
        }

        // ------------------------------------------
        // 4. Read the image groups from the file field names
        // ------------------------------------------

        const generalFiles = files.productImages ?? [];

        const groupedFiles = Object.entries(files)
            .filter(([field]) => field.startsWith(VARIANT_IMAGE_PREFIX))
            .map(([field, list]) => ({
                group: field.slice(VARIANT_IMAGE_PREFIX.length).trim(),
                files: list,
            }))
            .filter((g) => g.files.length > 0);

        const totalFiles =
            generalFiles.length +
            groupedFiles.reduce((sum, g) => sum + g.files.length, 0);

        if (totalFiles === 0) {
            throw new AppError(400, "At least one product image is required.");
        }

        // no imageGroup in the request: the attribute is inferred from the groups
        const imageAttribute = resolveImageAttribute(
            variants.map((v) => v.attributes),
            groupedFiles.map((g) => g.group),
        );

        // ------------------------------------------
        // 5. Upload images (only after all validation passed)
        // ------------------------------------------

        // const imageRows: {
        //     groupValue: string | null;
        //     url: string;
        //     urlName: string;
        //     publicId: string;
        //     type: string;
        //     position: number;
        // }[] = [];

        // const uploadImage = async (
        //     file: UploadFile,
        //     folder: string,
        //     groupValue: string | null,
        // ) => {
        //     if (!file.mimetype) {
        //         throw new AppError(400, "Image MIME type is missing.");
        //     }

        //     const uploaded = await CloudinaryService.upload(file, { folder });

        //     if (!uploaded.public_id) {
        //         throw new AppError(500, "Uploaded image public ID is missing.");
        //     }

        //     // tracked right away, so a later failure still rolls this one back
        //     uploadedPublicIds.push(uploaded.public_id);

        //     imageRows.push({
        //         groupValue,
        //         url: uploaded.secure_url,
        //         urlName: file.originalname,
        //         publicId: uploaded.public_id,
        //         type: file.mimetype,
        //         position: imageRows.length, // order inside each group is preserved
        //     });
        // };

        // for (const file of generalFiles) {
        //     await uploadImage(
        //         file,
        //         CloudinaryFolders.product.productImage,
        //         null,
        //     );
        // }

        // for (const { group, files: groupFiles } of groupedFiles) {
        //     for (const file of groupFiles) {
        //         await uploadImage(
        //             file,
        //             CloudinaryFolders.product.variantImage,
        //             group,
        //         );
        //     }
        // }

        const jobs: UploadJob[] = [
            ...generalFiles.map((file) => ({
                file,
                folder: CloudinaryFolders.product.productImage,
                groupValue: null,
            })),
            ...groupedFiles.flatMap(({ group, files: groupFiles }) =>
                groupFiles.map((file) => ({
                    file,
                    folder: CloudinaryFolders.product.variantImage,
                    groupValue: group,
                })),
            ),
        ];

        // position is fixed up front, so parallel uploads still keep the slide order
        const uploadImage = async (
            { file, folder, groupValue }: UploadJob,
            position: number,
        ) => {
            if (!file.mimetype) {
                throw new AppError(400, "Image MIME type is missing.");
            }

            const uploaded = await CloudinaryService.upload(file, { folder });

            if (!uploaded.public_id) {
                throw new AppError(500, "Uploaded image public ID is missing.");
            }

            // tracked right away, so a later failure still rolls this one back
            uploadedPublicIds.push(uploaded.public_id);

            return {
                groupValue,
                url: uploaded.secure_url,
                urlName: file.originalname,
                publicId: uploaded.public_id,
                type: file.mimetype,
                position,
            };
        };

        const imageRows: Awaited<ReturnType<typeof uploadImage>>[] = [];

        for (let start = 0; start < jobs.length; start += UPLOAD_CONCURRENCY) {
            const batch = jobs.slice(start, start + UPLOAD_CONCURRENCY);

            // allSettled, not Promise.all: wait until every upload in the batch has
            // finished, so all the successful ones are tracked before the rollback runs
            const results = await Promise.allSettled(
                batch.map((job, i) => uploadImage(job, start + i)),
            );

            for (const result of results) {
                if (result.status === "rejected") throw result.reason;
                imageRows.push(result.value);
            }
        }

        // ------------------------------------------
        // 6. Create product + variants + images (one nested write)
        // ------------------------------------------

        return await prisma.product.create({
            data: {
                name: name.trim(),
                slug: formattedSlug,
                ...(description !== undefined && {
                    description: description.trim(),
                }),
                categoryId,
                ...(brandId && { brandId }),
                status,
                imageAttribute: imageAttribute ?? null,

                images: { create: imageRows },

                variants: {
                    create: variants.map((variant, index) => ({
                        sku: variant.sku,
                        price: variant.price,
                        ...(variant.compareAtPrice !== undefined && {
                            compareAtPrice: variant.compareAtPrice,
                        }),
                        stockQuantity: variant.stockQuantity,
                        attributes:
                            variant.attributes as Prisma.InputJsonObject,
                        position: index,
                    })),
                },
            },

            include: {
                images: {
                    where: { isDeleted: false },
                    orderBy: { position: "asc" },
                },
                variants: {
                    where: { isDeleted: false },
                    orderBy: { position: "asc" },
                },
                brand: true,
                category: true,
            },
        });
    } catch (error) {
        // ------------------------------------------
        // Rollback Cloudinary uploads
        // ------------------------------------------

        // allSettled: one failed delete must not hide the original error
        await Promise.allSettled(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

/* ------------------------------------------------------------------ */
/* updateProduct                                                      */
/* ------------------------------------------------------------------ */

export const updateProduct = async (
    productId: string,
    payload: UpdateProductPayload,
    files: Record<string, UploadFile[]> = {},
) => {
    const uploadedPublicIds: string[] = [];

    try {
        // ------------------------------------------
        // 1. Find the product
        // ------------------------------------------

        const product = await prisma.product.findFirst({
            where: { id: productId, isDeleted: false },
            select: {
                id: true,
                slug: true,
                imageAttribute: true,
                variants: {
                    where: { isDeleted: false },
                    select: {
                        id: true,
                        sku: true,
                        price: true,
                        compareAtPrice: true,
                        attributes: true,
                    },
                },
            },
        });

        if (!product) throw new AppError(404, "Product not found");

        const { generalFiles, groupedFiles } = splitImageFiles(files);
        const variantUpdates = payload.variants ?? [];
        const hasFiles = generalFiles.length > 0 || groupedFiles.length > 0;

        const hasFieldUpdates = (
            [
                "name",
                "slug",
                "description",
                "categoryId",
                "brandId",
                "status",
            ] as const
        ).some((key) => payload[key] !== undefined);

        if (!hasFieldUpdates && variantUpdates.length === 0 && !hasFiles) {
            throw new AppError(400, "Nothing to update.");
        }

        // ------------------------------------------
        // 2. Slug (only checked when it actually changes)
        // ------------------------------------------

        let formattedSlug: string | undefined;

        if (payload.slug !== undefined) {
            formattedSlug = payload.slug
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");

            if (formattedSlug !== product.slug) {
                const taken = await prisma.product.findFirst({
                    where: { slug: formattedSlug, id: { not: productId } },
                });

                if (taken) {
                    throw new AppError(
                        409,
                        taken.isDeleted
                            ? "A deleted product with this slug already exists. Please restore it instead."
                            : "A product with this slug already exists.",
                    );
                }
            }
        }

        // ------------------------------------------
        // 3. Category + brand (brandId: null removes the brand)
        // ------------------------------------------

        if (payload.categoryId !== undefined) {
            const category = await prisma.category.findFirst({
                where: { id: payload.categoryId, isDeleted: false },
            });
            if (!category) throw new AppError(404, "Category not found");
        }

        if (payload.brandId) {
            const brand = await prisma.brand.findFirst({
                where: { id: payload.brandId, isDeleted: false },
            });
            if (!brand) throw new AppError(404, "Brand not found");
        }

        // ------------------------------------------
        // 4. Variant updates (matched by SKU)
        // ------------------------------------------

        const variantBySku = new Map<string, (typeof product.variants)[number]>(
            product.variants.map((v) => [v.sku, v] as const),
        );
        const seenSkus = new Set<string>();

        for (const update of variantUpdates) {
            if (seenSkus.has(update.sku)) {
                throw new AppError(
                    409,
                    `SKU "${update.sku}" appears twice in the request.`,
                );
            }
            seenSkus.add(update.sku);

            const current = variantBySku.get(update.sku);
            if (!current) {
                throw new AppError(
                    404,
                    `Variant with SKU "${update.sku}" not found on this product.`,
                );
            }

            // check the final values, not just the ones that were sent
            const nextPrice = update.price ?? Number(current.price);
            const nextCompare =
                update.compareAtPrice !== undefined
                    ? update.compareAtPrice
                    : current.compareAtPrice === null
                      ? null
                      : Number(current.compareAtPrice);

            if (nextCompare !== null && nextCompare < nextPrice) {
                throw new AppError(
                    400,
                    `Variant "${update.sku}": compare at price must not be lower than the price.`,
                );
            }
        }

        // ------------------------------------------
        // 5. New image files: groups must be existing values of the image attribute
        // ------------------------------------------

        const { imageAttribute } = product;

        if (groupedFiles.length > 0) {
            if (!imageAttribute) {
                throw new AppError(
                    400,
                    "This product shares one gallery across all variants. Upload to productImages instead.",
                );
            }

            const validValues = new Set(
                product.variants.map(
                    (v) => toAttrs(v.attributes)[imageAttribute] ?? "",
                ),
            );

            for (const { group } of groupedFiles) {
                if (!validValues.has(group)) {
                    throw new AppError(
                        400,
                        `"${group}" is not a ${imageAttribute} of this product. Existing: ${[...validValues].join(", ")}.`,
                    );
                }
            }
        }

        // ------------------------------------------
        // 6. Upload new images (after all validation passed)
        // ------------------------------------------

        let imageRows: ImageRow[] = [];

        if (hasFiles) {
            const last = await prisma.productImage.aggregate({
                where: { productId, isDeleted: false },
                _max: { position: true },
            });
            const startPosition = (last._max.position ?? -1) + 1;

            const jobs: UploadJob[] = [
                ...generalFiles.map((file) => ({
                    file,
                    folder: CloudinaryFolders.product.productImage,
                    groupValue: null,
                })),
                ...groupedFiles.flatMap(({ group, files: groupFiles }) =>
                    groupFiles.map((file) => ({
                        file,
                        folder: CloudinaryFolders.product.variantImage,
                        groupValue: group,
                    })),
                ),
            ];

            imageRows = await uploadImageJobs(
                jobs,
                startPosition,
                uploadedPublicIds,
            );
        }

        // ------------------------------------------
        // 7. Save everything in one transaction
        // ------------------------------------------

        return await prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id: productId },
                data: {
                    ...(payload.name !== undefined && {
                        name: payload.name.trim(),
                    }),
                    ...(formattedSlug !== undefined && { slug: formattedSlug }),
                    ...(payload.description !== undefined && {
                        description: payload.description.trim(),
                    }),
                    ...(payload.categoryId !== undefined && {
                        categoryId: payload.categoryId,
                    }),
                    ...(payload.brandId !== undefined && {
                        brandId: payload.brandId,
                    }),
                    ...(payload.status !== undefined && {
                        status: payload.status,
                    }),
                },
            });

            for (const update of variantUpdates) {
                await tx.productVariant.update({
                    where: { id: variantBySku.get(update.sku)!.id },
                    data: {
                        ...(update.price !== undefined && {
                            price: update.price,
                        }),
                        ...(update.compareAtPrice !== undefined && {
                            compareAtPrice: update.compareAtPrice,
                        }),
                        ...(update.stockQuantity !== undefined && {
                            stockQuantity: update.stockQuantity,
                        }),
                    },
                });
            }

            if (imageRows.length > 0) {
                await tx.productImage.createMany({
                    data: imageRows.map((row) => ({ ...row, productId })),
                });
            }

            return tx.product.findUniqueOrThrow({
                where: { id: productId },
                include: {
                    images: {
                        where: { isDeleted: false },
                        orderBy: { position: "asc" },
                    },
                    variants: {
                        where: { isDeleted: false },
                        orderBy: { position: "asc" },
                    },
                    brand: true,
                    category: true,
                },
            });
        });
    } catch (error) {
        // allSettled: one failed delete must not hide the original error
        await Promise.allSettled(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};
