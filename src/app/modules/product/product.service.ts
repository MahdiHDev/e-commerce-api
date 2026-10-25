import { randomUUID } from "node:crypto";
import { Prisma } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { generateProductCode } from "../../utils/generateProductCode";
import { generateVariantSku } from "../../utils/generateSku";

const createProduct = async (
    payload: CreateProductPayload,
    files?: Record<string, UploadFile[]>,
) => {
    const { name, description, categoryId, brandId, status, colors } = payload;

    const uploadedPublicIds: string[] = [];

    // Normalize input before validation and persistence
    const normalizedColors = colors.map((color) => ({
        ...color,
        name: color.name.trim(),
        hexCode: color.hexCode.trim().toUpperCase(),
        variants: color.variants.map((variant) => ({
            ...variant,
            size: variant.size.trim().toUpperCase(),
        })),
    }));

    // 1. Validate category
    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            isDeleted: false,
        },
    });

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    // 2. Validate brand
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

    // 3. Generate slug
    const formattedSlug = name.trim().toLowerCase().replace(/\s+/g, "-");

    const existingProduct = await prisma.product.findUnique({
        where: {
            slug: formattedSlug,
        },
    });

    if (existingProduct) {
        throw new AppError(409, "A product with this slug already exists.");
    }

    // 4. Validate duplicate colors and sizes
    const colorNames = normalizedColors.map((color) =>
        color.name.toLowerCase(),
    );

    if (new Set(colorNames).size !== colorNames.length) {
        throw new AppError(400, "Duplicate colors are not allowed");
    }

    for (const color of normalizedColors) {
        const sizes = color.variants.map((variant) => variant.size);

        if (new Set(sizes).size !== sizes.length) {
            throw new AppError(400, `Duplicate sizes found for ${color.name}`);
        }
    }

    // 5. Validate uploaded file fields
    for (const fieldName of Object.keys(files ?? {})) {
        const match = /^colorImages_(\d+)$/.exec(fieldName);

        if (!match || Number(match[1]) >= normalizedColors.length) {
            throw new AppError(
                400,
                `Invalid product image field: ${fieldName}`,
            );
        }
    }

    // 6. Generate product code
    const productCode = generateProductCode(name);

    try {
        // 7. Upload images for each color
        const colorsWithImages = [];

        for (const [colorIndex, color] of normalizedColors.entries()) {
            const colorFiles = files?.[`colorImages_${colorIndex}`] ?? [];

            const images = [];

            for (const [imageIndex, file] of colorFiles.entries()) {
                const uploadedImage = await CloudinaryService.upload(file, {
                    folder: CloudinaryFolders.product.productColor,
                });

                uploadedPublicIds.push(uploadedImage.public_id);

                images.push({
                    url: uploadedImage.secure_url,
                    publicId: uploadedImage.public_id,
                    imageName: file.originalname,
                    imageType: file.mimetype,
                    position: imageIndex,
                    isPrimary: imageIndex === 0,
                });
            }

            colorsWithImages.push({
                ...color,
                images,
            });
        }

        // 8. Create product with Prisma transaction
        const result = await prisma.$transaction(
            async (tx) => {
                // Create product first
                const product = await tx.product.create({
                    data: {
                        name: name.trim(),
                        slug: formattedSlug,
                        productCode,
                        description,
                        categoryId,
                        brandId,
                        status: status ?? "DRAFT",
                    },
                });

                // Create colors and their images/variants
                for (const [colorIndex, color] of colorsWithImages.entries()) {
                    const createdColor = await tx.productColor.create({
                        data: {
                            productId: product.id,
                            name: color.name,
                            hexCode: color.hexCode,
                            position: color.position ?? colorIndex,

                            images: {
                                create: color.images,
                            },
                        },
                    });

                    // Create variants for this color
                    await tx.productVariant.createMany({
                        data: color.variants.map((variant) => {
                            const variantId = randomUUID();

                            return {
                                id: variantId,
                                productId: product.id,
                                colorId: createdColor.id,
                                size: variant.size,

                                sku: generateVariantSku(
                                    productCode,
                                    color.name,
                                    variant.size,
                                    variantId,
                                ),

                                price: new Prisma.Decimal(variant.price),

                                compareAtPrice:
                                    variant.compareAtPrice == null
                                        ? null
                                        : new Prisma.Decimal(
                                              variant.compareAtPrice,
                                          ),

                                stockQuantity: variant.stockQuantity,
                            };
                        }),
                    });
                }

                return tx.product.findUniqueOrThrow({
                    where: {
                        id: product.id,
                    },
                    include: {
                        category: true,
                        brand: true,
                        colors: {
                            orderBy: {
                                position: "asc",
                            },
                            include: {
                                images: {
                                    orderBy: {
                                        position: "asc",
                                    },
                                },
                                variants: true,
                            },
                        },
                    },
                });
            },
            {
                maxWait: 5000,
                timeout: 15000,
            },
        );

        return result;
    } catch (error) {
        // Delete uploaded images if product creation fails
        await Promise.allSettled(
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
