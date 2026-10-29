import { Prisma } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import {
    CreateProductPayload,
    UpdateProductPayload,
} from "./product.validation";

const createProduct = async (
    payload: CreateProductPayload,
    files?: Record<string, UploadFile[]>,
) => {
    const { name, slug, description, categoryId, brandId, status, variants } =
        payload;

    const uploadedPublicIds: string[] = [];

    try {
        // ------------------------------------------
        // 1. Format slug
        // ------------------------------------------

        const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

        // ------------------------------------------
        // 2. Check duplicate product slug
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
        // 3. Check category
        // ------------------------------------------

        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                isDeleted: false,
            },
        });

        if (!category) {
            throw new AppError(404, "Category not found");
        }

        // ------------------------------------------
        // 4. Check brand if provided
        // ------------------------------------------

        if (brandId) {
            const brand = await prisma.brand.findFirst({
                where: {
                    id: brandId,
                    isDeleted: false,
                },
            });

            if (!brand) {
                throw new AppError(404, "Brand not found");
            }
        }

        // ------------------------------------------
        // 5. Check duplicate SKUs inside request
        // ------------------------------------------

        const skuList = variants.map((variant) => variant.sku);

        const uniqueSkus = new Set(skuList);

        if (skuList.length !== uniqueSkus.size) {
            throw new AppError(409, "Duplicate SKU found in product variants.");
        }

        // ------------------------------------------
        // 6. Check whether SKU already exists
        // ------------------------------------------

        const existingVariant = await prisma.productVariant.findFirst({
            where: {
                sku: {
                    in: skuList,
                },
            },
        });

        if (existingVariant) {
            throw new AppError(
                409,
                `Variant with SKU "${existingVariant.sku}" already exists.`,
            );
        }

        // ------------------------------------------
        // 7. Validate + upload product images
        // ------------------------------------------

        const productImageFiles = files?.productImages ?? [];

        if (productImageFiles.length === 0) {
            throw new AppError(400, "At least one product image is required.");
        }

        const uploadedProductImages = await Promise.all(
            productImageFiles.map((file) =>
                CloudinaryService.upload(file, {
                    folder: CloudinaryFolders.product.productImage,
                }),
            ),
        );

        uploadedProductImages.forEach((image) => {
            if (image.public_id) {
                uploadedPublicIds.push(image.public_id);
            }
        });

        // ------------------------------------------
        // 8. Upload variant images
        // ------------------------------------------

        type VariantImageData = {
            url: string;
            name: string;
            publicId: string;
            type: string;
            position: number;
        };

        const variantImageMap: Record<string, VariantImageData[]> = {};

        // Find the unique image groups.
        const imageGroups = new Set(
            variants.map((variant) => variant.imageGroup),
        );

        for (const imageGroup of imageGroups) {
            const imageFiles = files?.[`variantImages_${imageGroup}`] ?? [];

            if (imageFiles.length === 0) {
                throw new AppError(
                    400,
                    `At least one image is required for image group "${imageGroup}".`,
                );
            }

            const images: VariantImageData[] = [];

            // Upload each file sequentially so each successful upload
            // is tracked immediately for rollback.
            for (const [index, file] of imageFiles.entries()) {
                if (!file.mimetype) {
                    throw new AppError(
                        400,
                        "Variant image MIME type is missing.",
                    );
                }

                const uploaded = await CloudinaryService.upload(file, {
                    folder: CloudinaryFolders.product.variantImage,
                });

                if (!uploaded.public_id) {
                    throw new AppError(
                        500,
                        "Uploaded image public ID is missing.",
                    );
                }

                uploadedPublicIds.push(uploaded.public_id);

                images.push({
                    url: uploaded.secure_url,
                    name: uploaded.original_filename,
                    publicId: uploaded.public_id,
                    type: file.mimetype,
                    position: index,
                });
            }

            variantImageMap[imageGroup] = images;
        }

        const variantData = variants.map((variant) => {
            const {
                imageGroup,
                sku,
                price,
                compareAtPrice,
                stockQuantity,
                attributes,
            } = variant;

            const variantImages = variantImageMap[imageGroup];

            if (!variantImages || variantImages.length === 0) {
                throw new AppError(
                    400,
                    `Images not found for image group "${imageGroup}".`,
                );
            }

            return {
                sku: sku.trim(),
                price,

                ...(compareAtPrice !== undefined && {
                    compareAtPrice,
                }),

                stockQuantity,
                attributes,

                productVariantImages: {
                    create: variantImages.map((image) => ({
                        url: image.url,
                        name: image.name,
                        publicId: image.publicId,
                        type: image.type,
                        position: image.position,
                    })),
                },
            };
        });

        // ------------------------------------------
        // 9. Create product + variants + images
        // ------------------------------------------

        const result = await prisma.product.create({
            data: {
                name: name.trim(),

                slug: formattedSlug,

                ...(description !== undefined && {
                    description: description.trim(),
                }),

                categoryId,

                ...(brandId && {
                    brandId,
                }),

                status,

                // Product gallery images
                images: {
                    create: uploadedProductImages.map((image, index) => {
                        const file = productImageFiles[index];

                        if (!file) {
                            throw new AppError(
                                400,
                                "Product image file not found.",
                            );
                        }

                        return {
                            url: image.secure_url,
                            publicId: image.public_id,
                            urlName: file.originalname,
                            type: file.mimetype,
                            position: index,
                        };
                    }),
                },

                // Product variants
                variants: {
                    create: variantData,
                },
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

                variants: {
                    where: {
                        isDeleted: false,
                    },

                    orderBy: {
                        createdAt: "asc",
                    },

                    include: {
                        productVariantImages: {
                            where: {
                                isDeleted: false,
                            },

                            orderBy: {
                                position: "asc",
                            },
                        },
                    },
                },

                brand: true,

                category: true,
            },
        });

        return result;
    } catch (error) {
        // ------------------------------------------
        // Rollback Cloudinary uploads
        // ------------------------------------------

        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const updateProduct = async (
    id: string,
    payload: UpdateProductPayload,
    files?: Record<string, UploadFile[]>,
) => {
    const uploadedPublicIds: string[] = [];
    let oldPublicIds: string[] = [];

    try {
        // ------------------------------------------
        // 1. Find existing product
        // ------------------------------------------

        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                isDeleted: false,
            },
            include: {
                images: {
                    where: { isDeleted: false },
                },
                variants: {
                    where: { isDeleted: false },
                    include: {
                        productVariantImages: {
                            where: { isDeleted: false },
                        },
                    },
                },
            },
        });

        if (!existingProduct) {
            throw new AppError(404, "Product not found.");
        }

        // Collect old image IDs BEFORE changing database records.
        oldPublicIds = [
            ...existingProduct.images.map((image) => image.publicId),
            ...existingProduct.variants.flatMap((variant) =>
                variant.productVariantImages.map((image) => image.publicId),
            ),
        ];

        // ------------------------------------------
        // 2. Validate slug
        // ------------------------------------------

        const formattedSlug = payload.slug
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, "-");

        if (formattedSlug) {
            const duplicateProduct = await prisma.product.findFirst({
                where: {
                    slug: formattedSlug,
                    isDeleted: false,
                    NOT: { id },
                },
            });

            if (duplicateProduct) {
                throw new AppError(
                    409,
                    "A product with this slug already exists.",
                );
            }

            const deletedProduct = await prisma.product.findFirst({
                where: {
                    slug: formattedSlug,
                    isDeleted: true,
                },
            });

            if (deletedProduct) {
                throw new AppError(
                    409,
                    "A deleted product with this slug already exists. Please restore it instead.",
                );
            }
        }

        // ------------------------------------------
        // 3. Validate category and brand
        // ------------------------------------------

        if (payload.categoryId !== undefined) {
            const category = await prisma.category.findFirst({
                where: {
                    id: payload.categoryId,
                    isDeleted: false,
                },
            });

            if (!category) {
                throw new AppError(404, "Category not found.");
            }
        }

        if (payload.brandId) {
            const brand = await prisma.brand.findFirst({
                where: {
                    id: payload.brandId,
                    isDeleted: false,
                },
            });

            if (!brand) {
                throw new AppError(404, "Brand not found.");
            }
        }

        // ------------------------------------------
        // 4. Validate variants and SKUs
        // ------------------------------------------

        const requestedVariants = payload.variants ?? [];
        const requestedSkus = requestedVariants.map((variant) => variant.sku);

        if (new Set(requestedSkus).size !== requestedSkus.length) {
            throw new AppError(409, "Duplicate SKU found in request.");
        }

        const existingVariantBySku = new Map(
            existingProduct.variants.map((variant) => [variant.sku, variant]),
        );

        for (const variant of requestedVariants) {
            if (!existingVariantBySku.has(variant.sku)) {
                throw new AppError(
                    404,
                    `Variant with SKU "${variant.sku}" was not found in this product.`,
                );
            }
        }

        // ------------------------------------------
        // 5. Upload replacement product gallery
        // ------------------------------------------

        const productImageFiles = files?.productImages ?? [];

        const newProductImages: {
            url: string;
            publicId: string;
            urlName: string;
            type: string;
            position: number;
        }[] = [];

        for (const [position, file] of productImageFiles.entries()) {
            const uploaded = await CloudinaryService.upload(file, {
                folder: CloudinaryFolders.product.productImage,
            });

            if (!uploaded.public_id) {
                throw new AppError(
                    500,
                    "Uploaded product image public ID is missing.",
                );
            }

            uploadedPublicIds.push(uploaded.public_id);

            newProductImages.push({
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
                urlName: file.originalname,
                type: file.mimetype,
                position,
            });
        }

        // ------------------------------------------
        // 6. Upload replacement images by imageGroup
        // ------------------------------------------

        type VariantImageData = {
            url: string;
            name: string;
            publicId: string;
            type: string;
            position: number;
        };

        const variantImageMap: Record<string, VariantImageData[]> = {};

        const imageGroups = new Set(
            requestedVariants.map((variant) => variant.imageGroup),
        );

        for (const imageGroup of imageGroups) {
            const imageFiles = files?.[`variantImages_${imageGroup}`] ?? [];

            // No files supplied: preserve existing images.
            if (imageFiles.length === 0) continue;

            const images: VariantImageData[] = [];

            for (const [position, file] of imageFiles.entries()) {
                const uploaded = await CloudinaryService.upload(file, {
                    folder: CloudinaryFolders.product.variantImage,
                });

                if (!uploaded.public_id) {
                    throw new AppError(
                        500,
                        "Uploaded variant image public ID is missing.",
                    );
                }

                uploadedPublicIds.push(uploaded.public_id);

                images.push({
                    url: uploaded.secure_url,
                    name: uploaded.original_filename,
                    publicId: uploaded.public_id,
                    type: file.mimetype,
                    position,
                });
            }

            variantImageMap[imageGroup] = images;
        }

        // ------------------------------------------
        // 7. Update database in a transaction
        // ------------------------------------------

        const result = await prisma.$transaction(async (tx) => {
            // Update product fields.
            await tx.product.update({
                where: { id },
                data: {
                    ...(payload.name !== undefined && {
                        name: payload.name.trim(),
                    }),
                    ...(formattedSlug !== undefined && {
                        slug: formattedSlug,
                    }),
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

            // Replace general gallery only when new files are supplied.
            if (newProductImages.length > 0) {
                await tx.productImage.updateMany({
                    where: {
                        productId: id,
                        isDeleted: false,
                    },
                    data: {
                        isDeleted: true,
                        deletedAt: new Date(),
                    },
                });

                await tx.productImage.createMany({
                    data: newProductImages.map((image) => ({
                        productId: id,
                        ...image,
                    })),
                });
            }

            // Update variant fields by SKU.
            for (const variant of requestedVariants) {
                const existingVariant = existingVariantBySku.get(variant.sku);

                if (!existingVariant) continue;

                await tx.productVariant.update({
                    where: { id: existingVariant.id },
                    data: {
                        ...(variant.price !== undefined && {
                            price: variant.price,
                        }),
                        ...(variant.compareAtPrice !== undefined && {
                            compareAtPrice: variant.compareAtPrice,
                        }),
                        ...(variant.stockQuantity !== undefined && {
                            stockQuantity: variant.stockQuantity,
                        }),
                        ...(variant.attributes !== undefined && {
                            attributes:
                                variant.attributes as Prisma.InputJsonValue,
                        }),
                    },
                });
            }

            // Replace images for every submitted variant in each
            // image group that received replacement files.
            for (const [imageGroup, images] of Object.entries(
                variantImageMap,
            )) {
                const groupVariants = requestedVariants
                    .filter((variant) => variant.imageGroup === imageGroup)
                    .map((variant) => existingVariantBySku.get(variant.sku))
                    .filter(
                        (variant): variant is NonNullable<typeof variant> =>
                            variant !== undefined,
                    );

                if (groupVariants.length === 0) {
                    throw new AppError(
                        400,
                        `No variants found for image group "${imageGroup}".`,
                    );
                }

                const variantIds = groupVariants.map((variant) => variant.id);

                await tx.productVariantImage.updateMany({
                    where: {
                        variantId: { in: variantIds },
                        isDeleted: false,
                    },
                    data: {
                        isDeleted: true,
                        deletedAt: new Date(),
                    },
                });

                await tx.productVariantImage.createMany({
                    data: groupVariants.flatMap((variant) =>
                        images.map((image) => ({
                            variantId: variant.id,
                            url: image.url,
                            name: image.name,
                            publicId: image.publicId,
                            type: image.type,
                            position: image.position,
                        })),
                    ),
                });
            }

            // Return updated product.
            return tx.product.findFirstOrThrow({
                where: {
                    id,
                    isDeleted: false,
                },
                include: {
                    images: {
                        where: { isDeleted: false },
                        orderBy: { position: "asc" },
                    },
                    variants: {
                        where: { isDeleted: false },
                        orderBy: { createdAt: "asc" },
                        include: {
                            productVariantImages: {
                                where: { isDeleted: false },
                                orderBy: { position: "asc" },
                            },
                        },
                    },
                    brand: true,
                    category: true,
                },
            });
        });

        // ------------------------------------------
        // 8. SAFE CLOUDINARY DELETION — ADD HERE, AFTER THE TRANSACTION.
        // ------------------------------------------
        for (const publicId of new Set(oldPublicIds)) {
            const [productImage, variantImage] = await Promise.all([
                prisma.productImage.findFirst({
                    where: {
                        publicId,
                        isDeleted: false,
                    },
                    select: { id: true },
                }),

                prisma.productVariantImage.findFirst({
                    where: {
                        publicId,
                        isDeleted: false,
                    },
                    select: { id: true },
                }),
            ]);

            if (!productImage && !variantImage) {
                await CloudinaryService.delete(publicId);
            }
        }

        return result;
    } catch (error) {
        // Remove newly uploaded assets if database update fails.
        await Promise.allSettled(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const deleteProduct = async (id: string) => {
    const existingProduct = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            variants: {
                where: {
                    isDeleted: false,
                },
            },
            images: {
                where: {
                    isDeleted: false,
                },
            },
        },
    });

    if (!existingProduct) {
        throw new AppError(404, "Product not found.");
    }

    const result = await prisma.$transaction(async (tx) => {
        // Soft-delete product images.
        await tx.productImage.updateMany({
            where: {
                productId: id,
                isDeleted: false,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        // Soft-delete variant images.
        await tx.productVariantImage.updateMany({
            where: {
                productVariantId: {
                    in: existingProduct.variants.map((variant) => variant.id),
                },
                isDeleted: false,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        // Soft-delete product variants.
        await tx.productVariant.updateMany({
            where: {
                productId: id,
                isDeleted: false,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        // Soft-delete the product.
        const deletedProduct = await tx.product.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        return deletedProduct;
    });

    return result;
};

const restoreProduct = async (id: string) => {
    const existingProduct = await prisma.product.findFirst({
        where: {
            id,
            isDeleted: true,
        },
    });

    if (!existingProduct) {
        throw new AppError(404, "Deleted product not found.");
    }

    const result = await prisma.$transaction(async (tx) => {
        // Restore product variants.
        await tx.productVariant.updateMany({
            where: {
                productId: id,
                isDeleted: true,
            },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });

        // Restore product gallery images.
        await tx.productImage.updateMany({
            where: {
                productId: id,
                isDeleted: true,
            },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });

        // Restore variant images belonging to this product's variants.
        const variants = await tx.productVariant.findMany({
            where: {
                productId: id,
            },
            select: {
                id: true,
            },
        });

        await tx.productVariantImage.updateMany({
            where: {
                productVariantId: {
                    in: variants.map((variant) => variant.id),
                },
                isDeleted: true,
            },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });

        // Restore the product.
        const restoredProduct = await tx.product.update({
            where: {
                id,
            },
            data: {
                isDeleted: false,
                deletedAt: null,
            },
        });

        return restoredProduct;
    });

    return result;
};

export const ProductServices = {
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
};
