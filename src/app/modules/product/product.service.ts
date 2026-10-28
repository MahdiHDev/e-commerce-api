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

export const ProductServices = {
    createProduct,
};
