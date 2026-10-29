// product.validation.ts

import { z } from "zod";

const productVariantSchema = z.object({
    sku: z.string().trim().min(1, "SKU is required"),

    price: z.coerce.number().positive("Price must be greater than 0"),

    compareAtPrice: z.coerce
        .number()
        .positive("Compare at price must be greater than 0")
        .optional(),

    stockQuantity: z.coerce
        .number()
        .int("Stock quantity must be an integer")
        .min(0, "Stock quantity cannot be negative"),

    attributes: z.record(z.string(), z.string().trim().min(1)),
    imageGroup: z.string().trim().min(1),
});

export const createProductSchema = z.object({
    name: z.string().trim().min(1, "Product name is required"),

    slug: z.string().trim().min(1, "Product slug is required"),

    description: z.string().trim().optional(),

    categoryId: z.string().uuid("Invalid category ID"),

    brandId: z.string().uuid("Invalid brand ID").optional(),

    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),

    variants: z
        .array(productVariantSchema)
        .min(1, "At least one product variant is required"),
});

export type CreateProductPayload = z.infer<typeof createProductSchema>;

export type ProductVariantPayload = z.infer<typeof productVariantSchema>;

export const updateProductSchema = z.object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().trim().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().nullable().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),

    variants: z
        .array(
            z.object({
                sku: z.string().trim().min(1),
                price: z.number().positive().optional(),
                compareAtPrice: z.number().positive().nullable().optional(),
                stockQuantity: z.number().int().min(0).optional(),
                attributes: z.record(z.string(), z.unknown()).optional(),
                imageGroup: z.string().trim().min(1),
            }),
        )
        .optional(),
});

export type UpdateProductPayload = z.infer<typeof updateProductSchema>;
