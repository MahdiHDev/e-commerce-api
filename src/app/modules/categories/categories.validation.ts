import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required"),
    slug: z.string().trim().min(1, "Category slug is required"),
    parentId: z.string().optional(),
});

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
    name: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    parentId: z.string().optional(),
});

export type updateCategoryPayload = z.infer<typeof updateCategorySchema>;
