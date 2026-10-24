import { Prisma } from "../../../generated/client";

export const categorySearchableFields = [
    "name",
    "slug",
    "children.name",
    "children.slug",
];

export const categoryFilterableFields = [];

export const categoryIncludeConfig: Partial<
    Record<
        keyof Prisma.CategoryInclude,
        Prisma.CategoryInclude[keyof Prisma.CategoryInclude]
    >
> = {
    children: true,
};
