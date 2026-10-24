import { z } from "zod";

export const createBrandSchema = z.object({
    name: z.string().trim().min(1, "Brand name is required"),
    slug: z.string().trim().min(1, "Brand slug is required"),
    description: z.string().optional(),
});

export type CreateBrandPayload = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = z.object({
    name: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
});

export type updateBrandPayload = z.infer<typeof updateBrandSchema>;
