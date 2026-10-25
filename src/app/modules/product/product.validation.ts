import z from "zod";

const createProductSchema = z.object({
    name: z.string().trim().min(1, "Product name is required"),
    slug: z.string().trim().min(1, "Product slug is required"),
    description: z.string().optional(),
});

export type CreateProductPayload = z.infer<typeof createProductSchema>;
