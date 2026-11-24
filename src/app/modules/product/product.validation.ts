
import { z } from "zod";

// -----------------------------------------
// PRODUCT OPTION
// -----------------------------------------

export const productOptionSchema = z.object({
  name: z.string().trim().min(1, "Option name is required"),

  values: z
    .array(
      z.string().trim().min(1, "Option value is required")
    )
    .min(1, "At least one option value is required"),
}).superRefine((option, ctx) => {
  const normalized = option.values.map((v) => v.toLowerCase());

  if (new Set(normalized).size !== normalized.length) {
    ctx.addIssue({
      code: "custom",
      message: "Duplicate option values are not allowed",
      path: ["values"],
    });
  }
});

// -----------------------------------------
// PRODUCT VARIANT
// -----------------------------------------

export const productVariantSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  compareAtPrice: z.coerce
    .number()
    .positive("Compare at price must be greater than 0")
    .nullable()
    .optional(),

  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .default(0),

  attributes: z.record(z.string(), z.string()).default({}),

  position: z.coerce.number().int().min(0).default(0),

  // Selected values for this variant.
  // Example: { Color: "Black", Size: "M" }
  optionValues: z.record(z.string(), z.string()).default({}),
});

// -----------------------------------------
// PRODUCT IMAGE
// -----------------------------------------

export const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),

  urlName: z.string().trim().min(1, "Image name is required"),

  publicId: z.string().trim().min(1, "Image public ID is required"),

  type: z.string().trim().min(1, "Image type is required"),

  position: z.coerce.number().int().min(0).default(0),

  // Optional assignment to an option value.
  // Used during creation before OptionValue IDs exist.
  optionName: z.string().trim().min(1).optional(),

  optionValue: z.string().trim().min(1).optional(),

  // Optional grouping label.
  groupValue: z.string().trim().nullable().optional(),
}).superRefine((image, ctx) => {
  if (
    Boolean(image.optionName) !== Boolean(image.optionValue)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Option name and option value must be provided together",
      path: ["optionValue"],
    });
  }
});

// -----------------------------------------
// CREATE PRODUCT
// -----------------------------------------

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),

  slug: z.string().trim().min(1, "Product slug is required"),

  description: z.string().trim().nullable().optional(),

  categoryId: z.string().uuid("Invalid category ID"),

  brandId: z.string().uuid("Invalid brand ID").nullable().optional(),

  status: z
    .enum(["DRAFT", "ACTIVE", "ARCHIVED"])
    .default("DRAFT"),

  options: z.array(productOptionSchema).default([]),


  variants: z
    .array(productVariantSchema).default([]),

  images: z.array(productImageSchema).default([]),


// for non-variant products
   sku: z.string().trim().min(1, "SKU is required").optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0").optional(),

  compareAtPrice: z.coerce
    .number()
    .positive("Compare at price must be greater than 0")
    .nullable()
    .optional(),

  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .optional(),

  attributes: z.record(z.string(), z.string()).optional(),

}).superRefine((product, ctx) => {
  // Check duplicate option names
  const optionNames = product.options.map((o) =>
    o.name.toLowerCase()
  );

  if (new Set(optionNames).size !== optionNames.length) {
    ctx.addIssue({
      code: "custom",
      message: "Duplicate product option names are not allowed",
      path: ["options"],
    });
  }

  // Check duplicate SKUs
  const skus = product.variants.map((v) => v.sku.toLowerCase());

  if (new Set(skus).size !== skus.length) {
    ctx.addIssue({
      code: "custom",
      message: "Duplicate variant SKUs are not allowed",
      path: ["variants"],
    });
  }

  // Check variant option selections
  const optionMap = new Map(
    product.options.map((option) => [
      option.name,
      new Set(option.values),
    ])
  );

  for (const [index, variant] of product.variants.entries()) {
    const selectedOptions = Object.entries(variant.optionValues);

    if (selectedOptions.length !== product.options.length) {
      ctx.addIssue({
        code: "custom",
        message: "Each variant must select one value from every product option",
        path: ["variants", index, "optionValues"],
      });
    }

    for (const [optionName, value] of selectedOptions) {
      const allowedValues = optionMap.get(optionName);

      if (!allowedValues || !allowedValues.has(value)) {
        ctx.addIssue({
          code: "custom",
          message: `Invalid option value: ${optionName} - ${value}`,
          path: ["variants", index, "optionValues", optionName],
        });
      }
    }
  }

  // Check image option assignments
  for (const [index, image] of product.images.entries()) {
    if (image.optionName && image.optionValue) {
      const allowedValues = optionMap.get(image.optionName);

      if (!allowedValues || !allowedValues.has(image.optionValue)) {
        ctx.addIssue({
          code: "custom",
          message: "Image references an invalid product option value",
          path: ["images", index, "optionValue"],
        });
      }
    }
  }
});

// -----------------------------------------
// UPDATE PRODUCT
// -----------------------------------------

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),

  slug: z.string().trim().min(1).optional(),

  description: z.string().trim().nullable().optional(),

  categoryId: z.string().uuid().optional(),

  brandId: z.string().uuid().nullable().optional(),

  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),

  // Existing options and values should be updated
  // through an explicit nested update strategy.
  options: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().trim().min(1),
      values: z.array(
        z.object({
          id: z.string().optional(),
          value: z.string().trim().min(1),
        })
      ).optional(),
    })
  ).optional(),

  // Variants are matched by SKU.
  variants: z.array(
    z.object({
      sku: z.string().trim().min(1),

      price: z.coerce.number().positive().optional(),

      compareAtPrice: z.coerce
        .number()
        .positive()
        .nullable()
        .optional(),

      stockQuantity: z.coerce
        .number()
        .int()
        .min(0)
        .optional(),

      attributes: z.record(z.string(), z.string()).optional(),

      position: z.coerce.number().int().min(0).optional(),
    })
  ).optional(),

  images: z.array(
    z.object({
      id: z.string().uuid().optional(),

      url: z.string().url().optional(),

      urlName: z.string().trim().min(1).optional(),

      publicId: z.string().trim().min(1).optional(),

      type: z.string().trim().min(1).optional(),

      position: z.coerce.number().int().min(0).optional(),

      optionValueId: z.string().optional().nullable(),

      groupValue: z.string().nullable().optional(),

      isDeleted: z.boolean().optional(),
    })
  ).optional(),
});

// -----------------------------------------
// TYPES
// -----------------------------------------

export type CreateProductPayload = z.infer<
  typeof createProductSchema
>;

export type ProductVariantPayload = z.infer<
  typeof productVariantSchema
>;

export type ProductOptionPayload = z.infer<
  typeof productOptionSchema
>;

export type ProductImagePayload = z.infer<
  typeof productImageSchema
>;

export type UpdateProductPayload = z.infer<
  typeof updateProductSchema
>;
