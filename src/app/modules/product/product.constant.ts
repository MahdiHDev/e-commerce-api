// "variants.sku" works because the builder wraps 2-part search paths in `some` (to-many).
// Don't add "brand.name" / "category.name": brand and category are to-one relations,
// and `some` on them makes Prisma throw.
export const productSearchableFields = ["name", "slug", "variants.sku"];

// Keep this list explicit. An EMPTY list means "allow every field" in your builder.
// Dotted keys are not wrapped in `some`, so only to-one relations belong here.
// Price and attribute filters are handled in the service (they live on variants).
export const productFilterableFields = [
    "categoryId",
    "brandId",
    "status",
    "category.slug",
    "brand.slug",
];

export const productSortableFields = ["createdAt", "updatedAt", "name"];
