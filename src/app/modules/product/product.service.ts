import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { CreateProductPayload } from "./product.validation";

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
        // 7. Upload product images
        // ------------------------------------------

        const productImageFiles = files?.productImages ?? [];

        const uploadedProductImages =
            productImageFiles.length > 0
                ? await Promise.all(
                      productImageFiles.map((file) =>
                          CloudinaryService.upload(file, {
                              folder: CloudinaryFolders.product.productImage,
                          }),
                      ),
                  )
                : [];

        uploadedProductImages.forEach((image) => {
            if (image.public_id) {
                uploadedPublicIds.push(image.public_id);
            }
        });

        // ------------------------------------------
        // 8. Upload variant images
        // ------------------------------------------

        const variantImageMap: Record<
            string,
            {
                url: string;
                position: number;
            }[]
        > = {};

        for (const variant of variants) {
            const variantImageFiles =
                files?.[`variantImages_${variant.sku}`] ?? [];

            if (variantImageFiles.length === 0) {
                continue;
            }

            const uploadedVariantImages = await Promise.all(
                variantImageFiles.map((file) =>
                    CloudinaryService.upload(file, {
                        folder: CloudinaryFolders.product.variantImage,
                    }),
                ),
            );

            uploadedVariantImages.forEach((image) => {
                if (image.public_id) {
                    uploadedPublicIds.push(image.public_id);
                }
            });

            variantImageMap[variant.sku] = uploadedVariantImages.map(
                (image, index) => ({
                    url: image.secure_url,
                    position: index,
                }),
            );
        }

        const variantData = variants.map((variant) => {
            const variantImages = variantImageMap[variant.sku];

            return {
                sku: variant.sku.trim(),

                price: variant.price,

                ...(variant.compareAtPrice !== undefined && {
                    compareAtPrice: variant.compareAtPrice,
                }),

                stockQuantity: variant.stockQuantity,

                attributes: variant.attributes,

                ...(variantImages && variantImages.length > 0
                    ? {
                          productVariantImages: {
                              create: variantImages,
                          },
                      }
                    : {}),
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
                ...(uploadedProductImages.length > 0 && {
                    images: {
                        create: uploadedProductImages.map((image, index) => ({
                            url: image.secure_url,
                            position: index,
                        })),
                    },
                }),

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

export const ProductServices = {
    createProduct,
};
