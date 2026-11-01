// Drop-in replacement for your old createProduct.
// Adjust these imports to your project (names/paths are guesses based on your old code).

import { Prisma } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { CreateProductPayload } from "./playgound.validation";
import {
    prepareVariants,
    resolveImageAttribute,
    VARIANT_IMAGE_PREFIX,
} from "./product.helpers";

/* ------------------------------------------------------------------ */
/* createProduct                                                      */
/* ------------------------------------------------------------------ */

export const createProduct = async (
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

        const imageRows: {
            groupValue: string | null;
            url: string;
            urlName: string;
            publicId: string;
            type: string;
            position: number;
        }[] = [];

        const uploadImage = async (
            file: UploadFile,
            folder: string,
            groupValue: string | null,
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

            imageRows.push({
                groupValue,
                url: uploaded.secure_url,
                urlName: file.originalname,
                publicId: uploaded.public_id,
                type: file.mimetype,
                position: imageRows.length, // order inside each group is preserved
            });
        };

        for (const file of generalFiles) {
            await uploadImage(
                file,
                CloudinaryFolders.product.productImage,
                null,
            );
        }

        for (const { group, files: groupFiles } of groupedFiles) {
            for (const file of groupFiles) {
                await uploadImage(
                    file,
                    CloudinaryFolders.product.variantImage,
                    group,
                );
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
