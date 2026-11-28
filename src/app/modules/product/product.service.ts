import { randomUUID } from "node:crypto";
import { Prisma, Product } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
    productFilterableFields,
    productSearchableFields,
    productSortableFields,
} from "./product.constant";
import {
    prepareOptions,
    prepareVariants,
    // resolveImageAttribute,
    splitImageFiles,
    // toAttrs,
    uploadImageJobs,
    UploadJob,
    validateImageGroups,
} from "./product.helpers";
import {
    CreateProductPayload,
    UpdateProductPayload,
} from "./product.validation";

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
const getAllProducts = async (
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
            relationTypes: {
                variants: "many",
                category: "one",
            },
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
                // take: 1, // cover image
                select: { url: true },
            },
            variants: {
                where: { isDeleted: false },
                orderBy: { position: "asc" },
                // select: {
                //     id: true,
                //     price: true,
                //     compareAtPrice: true,
                //     stockQuantity: true,
                // },
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

const getProductsById = async (id: string) => {
    const result = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            categoryId: true,
            brandId: true,
            status: true,
            noVariants: true,
            hasVariants: true,
            imageAttribute: true,
            category: { select: { id: true, name: true, slug: true } },
            brand: { select: { id: true, name: true } },
            images: {
                where: { isDeleted: false },
                orderBy: { position: "asc" },
                select: {
                    id: true,
                    url: true,
                    urlName: true,
                    publicId: true,
                    type: true,
                    optionValueId: true,
                    groupValue: true,
                    position: true,
                },
            },
            variants: {
                where: { isDeleted: false },
                orderBy: { position: "asc" },
                select: {
                    id: true,
                    sku: true,
                    price: true,
                    compareAtPrice: true,
                    stockQuantity: true,
                    position: true,
                    attributes: true,
                },
            },
            productOptions: {
                select: {
                    id: true,
                    name: true,
                    productId: true,
                    values: { select: { id: true, value: true } },
                },
            },
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!result) {
        return null;
    }

    return {
        ...result,
        images: result.images.map(({ urlName, ...image }) => ({
            ...image,
            name: urlName,
        })),
        variants: result.variants.map((variant) => ({
            ...variant,
            price: Number(variant.price),
            compareAtPrice:
                variant.compareAtPrice === null
                    ? null
                    : Number(variant.compareAtPrice),
        })),
    };
};

const createProduct = async (
    payload: CreateProductPayload,
    files: Record<string, UploadFile[]> = {},
) => {
    const totalStart = performance.now();

    const logTime = (label: string, start: number) => {
        console.log(
            `[CREATE PRODUCT] ${label}: ${(performance.now() - start).toFixed(2)} ms`,
        );
    };

    let stepStart = performance.now();

    const uploadedPublicIds: string[] = [];

    try {
        const { name, slug, description, categoryId, brandId, status } =
            payload;

        const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

        // ------------------------------------------
        // 1. Check duplicate product slug
        // ------------------------------------------

        const existingProduct = await prisma.product.findFirst({
            where: {
                slug: formattedSlug,
            },
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
        // 2. Check category and brand
        // ------------------------------------------

        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                isDeleted: false,
            },
        });

        if (!category) {
            throw new AppError(404, "Category not found.");
        }

        if (brandId) {
            const brand = await prisma.brand.findFirst({
                where: {
                    id: brandId,
                    isDeleted: false,
                },
            });

            if (!brand) {
                throw new AppError(404, "Brand not found.");
            }
        }

        logTime("Basic database checks", stepStart);

        stepStart = performance.now();

        // ------------------------------------------
        // 3. Prepare options and variants
        // ------------------------------------------

        const options = prepareOptions(payload.options);

        const hasVariants = (payload.variants?.length ?? 0) > 0;

        console.log("Prepare options", payload?.variants);

        const variants = hasVariants
            ? prepareVariants(payload.variants, options)
            : [
                  {
                      sku: payload?.sku,
                      price: payload?.price,
                      compareAtPrice: payload?.compareAtPrice ?? null,
                      stockQuantity: payload.stockQuantity ?? 0,
                      position: 0,
                      attributes: {},
                      optionValues: {},
                  },
              ];
        // Your existing code...
        logTime("Prepare options and variants", stepStart);

        stepStart = performance.now();

        // Check Duplicate SKUs
        const skus = variants.map((variant) => variant.sku);

        if (new Set(skus).size !== skus.length) {
            throw new AppError(400, "Duplicate SKUs found in variants.");
        }

        logTime("SKU validation", stepStart);

        stepStart = performance.now();

        // ------------------------------------------
        // 4. Read and validate image groups
        // ------------------------------------------

        const { generalFiles, groupedFiles } = splitImageFiles(files);

        const totalFiles =
            generalFiles.length +
            groupedFiles.reduce((sum, group) => sum + group.files.length, 0);

        if (totalFiles === 0) {
            throw new AppError(400, "At least one product image is required.");
        }

        const imageAttribute = validateImageGroups(groupedFiles, options);

        // ------------------------------------------
        // 5. Prepare Cloudinary upload jobs
        // ------------------------------------------

        const jobs: UploadJob[] = [
            ...generalFiles.map((file) => ({
                file,
                folder: CloudinaryFolders.product.productImage,
                optionName: null,
                optionValue: null,
            })),

            ...groupedFiles.flatMap((group) =>
                group.files.map((file) => ({
                    file,
                    folder: CloudinaryFolders.product.variantImage,
                    optionName: group.optionName,
                    optionValue: group.optionValue,
                })),
            ),
        ];

        // ------------------------------------------
        // 6. Upload images
        // ------------------------------------------

        const imageRows = await uploadImageJobs(jobs, 0, uploadedPublicIds);

        logTime("Cloudinary uploads", stepStart);

        stepStart = performance.now();

        // ------------------------------------------
        // 7. Create product, options, variants
        //    and images in one transaction
        // ------------------------------------------

        const createdProduct = await prisma.$transaction(
            async (tx) => {
                // Create product and its options and values.
                const product = await tx.product.create({
                    data: {
                        name: name.trim(),
                        slug: formattedSlug,

                        ...(description !== undefined && {
                            description: description?.trim() ?? null,
                        }),

                        categoryId,

                        ...(brandId && {
                            brandId,
                        }),

                        status,
                        imageAttribute: imageAttribute ?? null,
                        noVariants: hasVariants ? false : true,
                        productOptions: {
                            create: options.map((option) => ({
                                name: option.name,
                                values: {
                                    create: option.values.map((value) => ({
                                        value,
                                    })),
                                },
                            })),
                        },
                    },

                    include: {
                        productOptions: {
                            include: {
                                values: true,
                            },
                        },
                    },
                });

                // --------------------------------------
                // 8. Build OptionValue lookup map
                // --------------------------------------

                const optionValueMap = new Map<string, string>();

                for (const option of product.productOptions) {
                    for (const value of option.values) {
                        const key = `${option.name.toLowerCase()}=${value.value.toLowerCase()}`;

                        optionValueMap.set(key, value.id);
                    }
                }

                // --------------------------------------
                // 9. Bulk create variants and
                //    their option relationships
                // --------------------------------------

                const variantRows: Prisma.ProductVariantCreateManyInput[] = [];

                const variantOptionRows: Prisma.VariantOptionValueCreateManyInput[] =
                    [];

                for (const variant of variants) {
                    const variantId = randomUUID();

                    const selectedValueIds = Object.entries(
                        variant.optionValues,
                    ).map(([optionName, optionValue]) => {
                        const key = `${optionName.toLowerCase()}=${optionValue.toLowerCase()}`;

                        const optionValueId = optionValueMap.get(key);

                        if (!optionValueId) {
                            throw new AppError(
                                400,
                                `Invalid option value: ${optionName} - ${optionValue}.`,
                            );
                        }

                        return optionValueId;
                    });

                    // Prepare variant record.
                    variantRows.push({
                        id: variantId,
                        productId: product.id,
                        sku: variant.sku as string,
                        price: new Prisma.Decimal(variant.price as number),

                        compareAtPrice:
                            variant.compareAtPrice == null
                                ? null
                                : new Prisma.Decimal(variant.compareAtPrice),

                        stockQuantity: variant.stockQuantity,
                        position: variant.position ?? 0,

                        attributes: (variant.attributes ??
                            {}) as Prisma.InputJsonValue,
                    });

                    // Prepare variant-option relationships.
                    for (const optionValueId of selectedValueIds) {
                        variantOptionRows.push({
                            variantId,
                            optionValueId,
                        });
                    }
                }

                // Insert all variants in one query.
                if (variantRows.length > 0) {
                    await tx.productVariant.createMany({
                        data: variantRows,
                    });
                }

                // Insert all variant-option relationships in one query.
                if (variantOptionRows.length > 0) {
                    await tx.variantOptionValue.createMany({
                        data: variantOptionRows,
                    });
                }

                // --------------------------------------
                // 10. Connect images to OptionValue records
                // --------------------------------------

                const productImages = imageRows.map((image, index) => {
                    const job = jobs[index];

                    let optionValueId: string | null = null;

                    if (job?.optionName && job?.optionValue) {
                        const key = `${job.optionName.toLowerCase()}=${job.optionValue.toLowerCase()}`;

                        optionValueId = optionValueMap.get(key) ?? null;

                        if (!optionValueId) {
                            throw new AppError(
                                400,
                                `Could not resolve image option value: ${key}.`,
                            );
                        }
                    }

                    return {
                        productId: product.id,
                        url: image.url,
                        urlName: image.urlName,
                        publicId: image.publicId,
                        type: image.type,
                        position: image.position,
                        groupValue: image.groupValue,
                        optionValueId,
                    };
                });

                if (productImages.length > 0) {
                    await tx.productImage.createMany({
                        data: productImages,
                    });
                }

                // --------------------------------------
                // 11. Return complete product
                // --------------------------------------

                return tx.product.findUniqueOrThrow({
                    where: {
                        id: product.id,
                    },

                    include: {
                        images: {
                            where: {
                                isDeleted: false,
                            },
                            orderBy: {
                                position: "asc",
                            },
                        },

                        productOptions: {
                            include: {
                                values: true,
                            },
                        },

                        variants: {
                            where: {
                                isDeleted: false,
                            },
                            orderBy: {
                                position: "asc",
                            },
                            include: {
                                optionValues: {
                                    include: {
                                        optionValue: {
                                            include: {
                                                option: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },

                        brand: true,
                        category: true,
                    },
                });
            },
            {
                maxWait: 5000,
                timeout: 10000,
            },
        );

        logTime("Database transaction", stepStart);

        console.log(
            `[CREATE PRODUCT] Total: ${(performance.now() - totalStart).toFixed(
                2,
            )} ms`,
        );

        return createdProduct;
    } catch (error) {
        // Roll back Cloudinary uploads if database creation fails.

        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

// const updateProduct = async (
//   productId: string,
//   payload: UpdateProductPayload,
//   files: Record<string, UploadFile[]> = {},
// ) => {
//   const uploadedPublicIds: string[] = [];

//   try {
//     // ------------------------------------------
//     // 1. Find the product
//     // ------------------------------------------

//     const product = await prisma.product.findFirst({
//       where: { id: productId, isDeleted: false },
//       select: {
//         id: true,
//         slug: true,
//         imageAttribute: true,
//         variants: {
//           where: { isDeleted: false },
//           select: {
//             id: true,
//             sku: true,
//             price: true,
//             compareAtPrice: true,
//             attributes: true,
//           },
//         },
//       },
//     });

//     if (!product) throw new AppError(404, "Product not found");

//     const { generalFiles, groupedFiles } = splitImageFiles(files);
//     const variantUpdates = payload.variants ?? [];
//     const hasFiles = generalFiles.length > 0 || groupedFiles.length > 0;

//     const hasFieldUpdates = (
//       [
//         "name",
//         "slug",
//         "description",
//         "categoryId",
//         "brandId",
//         "status",
//       ] as const
//     ).some((key) => payload[key] !== undefined);

//     if (!hasFieldUpdates && variantUpdates.length === 0 && !hasFiles) {
//       throw new AppError(400, "Nothing to update.");
//     }

//     // ------------------------------------------
//     // 2. Slug (only checked when it actually changes)
//     // ------------------------------------------

//     let formattedSlug: string | undefined;

//     if (payload.slug !== undefined) {
//       formattedSlug = payload.slug.trim().toLowerCase().replace(/\s+/g, "-");

//       if (formattedSlug !== product.slug) {
//         const taken = await prisma.product.findFirst({
//           where: { slug: formattedSlug, id: { not: productId } },
//         });

//         if (taken) {
//           throw new AppError(
//             409,
//             taken.isDeleted
//               ? "A deleted product with this slug already exists. Please restore it instead."
//               : "A product with this slug already exists.",
//           );
//         }
//       }
//     }

//     // ------------------------------------------
//     // 3. Category + brand (brandId: null removes the brand)
//     // ------------------------------------------

//     if (payload.categoryId !== undefined) {
//       const category = await prisma.category.findFirst({
//         where: { id: payload.categoryId, isDeleted: false },
//       });
//       if (!category) throw new AppError(404, "Category not found");
//     }

//     if (payload.brandId) {
//       const brand = await prisma.brand.findFirst({
//         where: { id: payload.brandId, isDeleted: false },
//       });
//       if (!brand) throw new AppError(404, "Brand not found");
//     }

//     // ------------------------------------------
//     // 4. Variant updates (matched by SKU)
//     // ------------------------------------------

//     const variantBySku = new Map<string, (typeof product.variants)[number]>(
//       product.variants.map((v) => [v.sku, v] as const),
//     );
//     const seenSkus = new Set<string>();

//     for (const update of variantUpdates) {
//       if (seenSkus.has(update.sku)) {
//         throw new AppError(
//           409,
//           `SKU "${update.sku}" appears twice in the request.`,
//         );
//       }
//       seenSkus.add(update.sku);

//       const current = variantBySku.get(update.sku);
//       if (!current) {
//         throw new AppError(
//           404,
//           `Variant with SKU "${update.sku}" not found on this product.`,
//         );
//       }

//       // check the final values, not just the ones that were sent
//       const nextPrice = update.price ?? Number(current.price);
//       const nextCompare =
//         update.compareAtPrice !== undefined
//           ? update.compareAtPrice
//           : current.compareAtPrice === null
//             ? null
//             : Number(current.compareAtPrice);

//       if (nextCompare !== null && nextCompare < nextPrice) {
//         throw new AppError(
//           400,
//           `Variant "${update.sku}": compare at price must not be lower than the price.`,
//         );
//       }
//     }

//     // ------------------------------------------
//     // 5. New image files: groups must be existing values of the image attribute
//     // ------------------------------------------

//     const { imageAttribute } = product;

//     if (groupedFiles.length > 0) {
//       if (!imageAttribute) {
//         throw new AppError(
//           400,
//           "This product shares one gallery across all variants. Upload to productImages instead.",
//         );
//       }

//       const validValues = new Set(
//         product.variants.map(
//           (v) => toAttrs(v.attributes)[imageAttribute] ?? "",
//         ),
//       );

//       for (const { group } of groupedFiles) {
//         if (!validValues.has(group)) {
//           throw new AppError(
//             400,
//             `"${group}" is not a ${imageAttribute} of this product. Existing: ${[...validValues].join(", ")}.`,
//           );
//         }
//       }
//     }

//     // ------------------------------------------
//     // 6. Upload new images (after all validation passed)
//     // ------------------------------------------

//     let imageRows: ImageRow[] = [];

//     if (hasFiles) {
//       const last = await prisma.productImage.aggregate({
//         where: { productId, isDeleted: false },
//         _max: { position: true },
//       });
//       const startPosition = (last._max.position ?? -1) + 1;

//       const jobs: UploadJob[] = [
//         ...generalFiles.map((file) => ({
//           file,
//           folder: CloudinaryFolders.product.productImage,
//           groupValue: null,
//         })),
//         ...groupedFiles.flatMap(({ group, files: groupFiles }) =>
//           groupFiles.map((file) => ({
//             file,
//             folder: CloudinaryFolders.product.variantImage,
//             groupValue: group,
//           })),
//         ),
//       ];

//       imageRows = await uploadImageJobs(jobs, startPosition, uploadedPublicIds);
//     }

//     // ------------------------------------------
//     // 7. Save everything in one transaction
//     // ------------------------------------------

//     return await prisma.$transaction(async (tx) => {
//       await tx.product.update({
//         where: { id: productId },
//         data: {
//           ...(payload.name !== undefined && {
//             name: payload.name.trim(),
//           }),
//           ...(formattedSlug !== undefined && { slug: formattedSlug }),
//           ...(payload.description !== undefined && {
//             description: payload.description.trim(),
//           }),
//           ...(payload.categoryId !== undefined && {
//             categoryId: payload.categoryId,
//           }),
//           ...(payload.brandId !== undefined && {
//             brandId: payload.brandId,
//           }),
//           ...(payload.status !== undefined && {
//             status: payload.status,
//           }),
//         },
//       });

//       for (const update of variantUpdates) {
//         await tx.productVariant.update({
//           where: { id: variantBySku.get(update.sku)!.id },
//           data: {
//             ...(update.price !== undefined && {
//               price: update.price,
//             }),
//             ...(update.compareAtPrice !== undefined && {
//               compareAtPrice: update.compareAtPrice,
//             }),
//             ...(update.stockQuantity !== undefined && {
//               stockQuantity: update.stockQuantity,
//             }),
//           },
//         });
//       }

//       if (imageRows.length > 0) {
//         await tx.productImage.createMany({
//           data: imageRows.map((row) => ({ ...row, productId })),
//         });
//       }

//       return tx.product.findUniqueOrThrow({
//         where: { id: productId },
//         include: {
//           images: {
//             where: { isDeleted: false },
//             orderBy: { position: "asc" },
//           },
//           variants: {
//             where: { isDeleted: false },
//             orderBy: { position: "asc" },
//           },
//           brand: true,
//           category: true,
//         },
//       });
//     });
//   } catch (error) {
//     // allSettled: one failed delete must not hide the original error
//     await Promise.allSettled(
//       uploadedPublicIds.map((publicId) => CloudinaryService.delete(publicId)),
//     );

//     throw error;
//   }
// };

const updateProduct = async (
    productId: string,
    payload: UpdateProductPayload,
    files: Record<string, UploadFile[]> = {},
) => {
    const uploadedPublicIds: string[] = [];
    const publicIdsToDelete = new Set<string>();
    let transactionCommitted = false;

    try {
        const product = await prisma.product.findFirst({
            where: { id: productId, isDeleted: false },
            include: {
                images: { where: { isDeleted: false } },
                variants: { where: { isDeleted: false } },
                productOptions: { include: { values: true } },
            },
        });

        if (!product) {
            throw new AppError(404, "Product not found.");
        }

        const scalarKeys = [
            "name",
            "slug",
            "description",
            "categoryId",
            "brandId",
            "status",
        ] as const;
        const hasUpdate =
            scalarKeys.some((key) => payload[key] !== undefined) ||
            (payload.options?.length ?? 0) > 0 ||
            (payload.variants?.length ?? 0) > 0 ||
            (payload.images?.length ?? 0) > 0 ||
            Object.values(files).some((fileList) => fileList.length > 0);

        if (!hasUpdate) {
            throw new AppError(400, "Nothing to update.");
        }

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

        if (payload.categoryId !== undefined) {
            const category = await prisma.category.findFirst({
                where: { id: payload.categoryId, isDeleted: false },
            });
            if (!category) throw new AppError(404, "Category not found.");
        }

        if (payload.brandId) {
            const brand = await prisma.brand.findFirst({
                where: { id: payload.brandId, isDeleted: false },
            });
            if (!brand) throw new AppError(404, "Brand not found.");
        }

        const variantBySku = new Map(
            product.variants.map((variant) => [variant.sku, variant]),
        );
        const seenUpdateSkus = new Set<string>();
        for (const update of payload.variants ?? []) {
            const normalizedSku = update.sku.toLowerCase();
            if (seenUpdateSkus.has(normalizedSku)) {
                throw new AppError(
                    409,
                    `SKU "${update.sku}" appears twice in the request.`,
                );
            }
            seenUpdateSkus.add(normalizedSku);

            const current = variantBySku.get(update.sku);
            if (!current) {
                throw new AppError(
                    404,
                    `Variant with SKU "${update.sku}" not found on this product.`,
                );
            }

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

        const finalOptions = product.productOptions.map((option) => ({
            id: option.id,
            name: option.name,
            values: option.values.map((value) => ({
                id: value.id,
                value: value.value,
            })),
        }));

        for (const update of payload.options ?? []) {
            const current = update.id
                ? finalOptions.find((option) => option.id === update.id)
                : undefined;
            if (update.id && !current) {
                throw new AppError(
                    404,
                    `Product option "${update.id}" not found.`,
                );
            }
            if (
                finalOptions.some(
                    (option) =>
                        option.id !== update.id &&
                        option.name.toLowerCase() ===
                            update.name.trim().toLowerCase(),
                )
            ) {
                throw new AppError(
                    409,
                    `Duplicate product option: ${update.name.trim()}.`,
                );
            }

            const target = current ?? { id: "", name: "", values: [] };
            if (!current) {
                finalOptions.push(target);
            }
            target.name = update.name.trim();

            for (const valueUpdate of update.values ?? []) {
                const currentValue = valueUpdate.id
                    ? target.values.find((value) => value.id === valueUpdate.id)
                    : undefined;
                if (valueUpdate.id && !currentValue) {
                    throw new AppError(
                        404,
                        `Option value "${valueUpdate.id}" not found.`,
                    );
                }
                if (
                    target.values.some(
                        (value) =>
                            value.id !== valueUpdate.id &&
                            value.value.toLowerCase() ===
                                valueUpdate.value.toLowerCase(),
                    )
                ) {
                    throw new AppError(
                        409,
                        `Duplicate value "${valueUpdate.value}" in option "${update.name.trim()}".`,
                    );
                }
                if (currentValue) {
                    currentValue.value = valueUpdate.value.trim();
                } else {
                    target.values.push({
                        id: "",
                        value: valueUpdate.value.trim(),
                    });
                }
            }
        }

        const { generalFiles, groupedFiles } = splitImageFiles(files);
        if (groupedFiles.length > 0) {
            validateImageGroups(
                groupedFiles,
                finalOptions.map((option) => ({
                    name: option.name,
                    values: option.values.map((value) => value.value),
                })),
            );
        }

        for (const imageUpdate of payload.images ?? []) {
            if (!imageUpdate.id) {
                throw new AppError(
                    400,
                    "Existing image updates must include an image id.",
                );
            }
            if (!product.images.some((image) => image.id === imageUpdate.id)) {
                throw new AppError(
                    404,
                    `Product image "${imageUpdate.id}" not found.`,
                );
            }
            if (imageUpdate.optionValueId) {
                const valid = finalOptions.some((option) =>
                    option.values.some(
                        (value) => value.id === imageUpdate.optionValueId,
                    ),
                );
                if (!valid) {
                    throw new AppError(
                        400,
                        "optionValueId does not belong to this product.",
                    );
                }
            }
        }

        for (const imageUpdate of payload.images ?? []) {
            const currentImage = product.images.find(
                (image) => image.id === imageUpdate.id,
            );
            if (
                currentImage &&
                (imageUpdate.isDeleted === true ||
                    (imageUpdate.publicId !== undefined &&
                        imageUpdate.publicId !== currentImage.publicId))
            ) {
                publicIdsToDelete.add(currentImage.publicId);
            }
        }

        let allJobs: UploadJob[] = [
            ...generalFiles.map((file) => ({
                file,
                folder: CloudinaryFolders.product.productImage,
                optionName: null,
                optionValue: null,
            })),
            ...groupedFiles.flatMap((group) =>
                group.files.map((file) => ({
                    file,
                    folder: CloudinaryFolders.product.variantImage,
                    optionName: group.optionName,
                    optionValue: group.optionValue,
                })),
            ),
        ];

        let imageRows: Awaited<ReturnType<typeof uploadImageJobs>> = [];
        if (allJobs.length > 0) {
            imageRows = await uploadImageJobs(allJobs, 0, uploadedPublicIds);
        }

        const result = await prisma.$transaction(
            async (tx) => {
                await tx.product.update({
                    where: { id: productId },
                    data: {
                        ...(payload.name !== undefined && {
                            name: payload.name.trim(),
                        }),
                        ...(formattedSlug !== undefined && {
                            slug: formattedSlug,
                        }),
                        ...(payload.description !== undefined && {
                            description: payload.description?.trim() ?? null,
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

                for (const update of payload.variants ?? []) {
                    const current = variantBySku.get(update.sku)!;
                    await tx.productVariant.update({
                        where: { id: current.id },
                        data: {
                            ...(update.price !== undefined && {
                                price: new Prisma.Decimal(update.price),
                            }),
                            ...(update.compareAtPrice !== undefined && {
                                compareAtPrice:
                                    update.compareAtPrice === null
                                        ? null
                                        : new Prisma.Decimal(
                                              update.compareAtPrice,
                                          ),
                            }),
                            ...(update.stockQuantity !== undefined && {
                                stockQuantity: update.stockQuantity,
                            }),
                            ...(update.attributes !== undefined && {
                                attributes:
                                    update.attributes as Prisma.InputJsonValue,
                            }),
                            ...(update.position !== undefined && {
                                position: update.position,
                            }),
                        },
                    });
                }

                let imageAttribute = product.imageAttribute;
                for (const update of payload.options ?? []) {
                    let optionId = update.id;
                    if (optionId) {
                        await tx.productOption.update({
                            where: { id: optionId },
                            data: { name: update.name.trim() },
                        });
                    } else {
                        const created = await tx.productOption.create({
                            data: { productId, name: update.name.trim() },
                        });
                        optionId = created.id;
                        const target = finalOptions.find(
                            (option) =>
                                option.id === "" &&
                                option.name === update.name.trim(),
                        );
                        if (target) target.id = created.id;
                    }

                    if (
                        product.imageAttribute &&
                        update.id &&
                        product.productOptions.find(
                            (option) => option.id === update.id,
                        )?.name === product.imageAttribute
                    ) {
                        imageAttribute = update.name.trim();
                    }

                    for (const valueUpdate of update.values ?? []) {
                        if (valueUpdate.id) {
                            await tx.optionValue.update({
                                where: { id: valueUpdate.id },
                                data: { value: valueUpdate.value.trim() },
                            });
                        } else {
                            const created = await tx.optionValue.create({
                                data: {
                                    optionId: optionId!,
                                    value: valueUpdate.value.trim(),
                                },
                            });
                            const targetOption = finalOptions.find(
                                (option) =>
                                    option.name.toLowerCase() ===
                                    update.name.trim().toLowerCase(),
                            );
                            const targetValue = targetOption?.values.find(
                                (value) =>
                                    value.id === "" &&
                                    value.value === valueUpdate.value.trim(),
                            );
                            if (targetValue) targetValue.id = created.id;
                        }
                    }
                }

                if (imageAttribute !== product.imageAttribute) {
                    await tx.product.update({
                        where: { id: productId },
                        data: { imageAttribute },
                    });
                }

                for (const update of payload.images ?? []) {
                    await tx.productImage.update({
                        where: { id: update.id! },
                        data: {
                            ...(update.url !== undefined && {
                                url: update.url,
                            }),
                            ...(update.urlName !== undefined && {
                                urlName: update.urlName,
                            }),
                            ...(update.publicId !== undefined && {
                                publicId: update.publicId,
                            }),
                            ...(update.type !== undefined && {
                                type: update.type,
                            }),
                            ...(update.position !== undefined && {
                                position: update.position,
                            }),
                            ...(update.optionValueId !== undefined && {
                                optionValueId: update.optionValueId,
                            }),
                            ...(update.groupValue !== undefined && {
                                groupValue: update.groupValue,
                            }),
                            ...(update.isDeleted !== undefined && {
                                isDeleted: update.isDeleted,
                                deletedAt: update.isDeleted ? new Date() : null,
                            }),
                        },
                    });
                }

                if (
                    payload.images?.some(
                        (imageUpdate) => imageUpdate.isDeleted === true,
                    )
                ) {
                    const remainingImages = await tx.productImage.findMany({
                        where: { productId, isDeleted: false },
                        orderBy: [
                            { position: "asc" },
                            { createdAt: "asc" },
                            { id: "asc" },
                        ],
                        select: { id: true },
                    });

                    for (const [position, image] of remainingImages.entries()) {
                        await tx.productImage.update({
                            where: { id: image.id },
                            data: { position },
                        });
                    }
                }

                if (imageRows.length > 0) {
                    const last = await tx.productImage.aggregate({
                        where: { productId, isDeleted: false },
                        _max: { position: true },
                    });
                    const nextPosition = (last._max.position ?? -1) + 1;
                    const optionValueMap = new Map<string, string>();
                    const options = await tx.productOption.findMany({
                        where: { productId },
                        include: { values: true },
                    });
                    for (const option of options) {
                        for (const value of option.values) {
                            optionValueMap.set(
                                `${option.name.toLowerCase()}=${value.value.toLowerCase()}`,
                                value.id,
                            );
                        }
                    }

                    await tx.productImage.createMany({
                        data: imageRows.map((row, index) => {
                            const job = allJobs[index];
                            let optionValueId: string | null = null;
                            if (job?.optionName && job?.optionValue) {
                                optionValueId =
                                    optionValueMap.get(
                                        `${job.optionName.toLowerCase()}=${job.optionValue.toLowerCase()}`,
                                    ) ?? null;
                                if (!optionValueId) {
                                    throw new AppError(
                                        400,
                                        "Could not resolve uploaded image option value.",
                                    );
                                }
                            }
                            return {
                                productId,
                                url: row.url,
                                urlName: row.urlName,
                                publicId: row.publicId,
                                type: row.type,
                                position: nextPosition + index,
                                groupValue: row.groupValue,
                                optionValueId,
                            };
                        }),
                    });
                }

                return tx.product.findUniqueOrThrow({
                    where: { id: productId },
                    include: {
                        images: {
                            where: { isDeleted: false },
                            orderBy: { position: "asc" },
                        },
                        productOptions: { include: { values: true } },
                        variants: {
                            where: { isDeleted: false },
                            orderBy: { position: "asc" },
                        },
                        brand: true,
                        category: true,
                    },
                });
            },
            { maxWait: 5000, timeout: 10000 },
        );

        transactionCommitted = true;
        await Promise.all(
            [...publicIdsToDelete].map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        return result;
    } catch (error) {
        if (!transactionCommitted) {
            await Promise.allSettled(
                uploadedPublicIds.map((publicId) =>
                    CloudinaryService.delete(publicId),
                ),
            );
        }
        throw error;
    }
};

export const ProductServices = {
    getAllProducts,
    getProductsById,
    createProduct,
    updateProduct,
};
