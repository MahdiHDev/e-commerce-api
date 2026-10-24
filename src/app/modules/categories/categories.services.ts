import { Category, Prisma } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
    categoryFilterableFields,
    categoryIncludeConfig,
    categorySearchableFields,
} from "./categories.constant";
import {
    CreateCategoryPayload,
    updateCategoryPayload,
} from "./categories.validation";

const getAllCategory = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        Category,
        Prisma.CategoryWhereInput,
        Prisma.CategoryInclude
    >(prisma.category, query, {
        searchableFields: categorySearchableFields,
        filterableFields: categoryFilterableFields,
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
            parentId: null,
        })
        .dynamicInclude(categoryIncludeConfig, ["children"])
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
};

const getCategoryById = async (id: string) => {
    const result = prisma.category.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            children: {
                where: {
                    isDeleted: false,
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(404, "Category not found");
    }

    return result;
};

const createCategory = async (payload: CreateCategoryPayload) => {
    const { parentId, slug, name } = payload;

    const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const existingCategory = await prisma.category.findUnique({
        where: {
            slug,
        },
    });

    if (existingCategory) {
        if (existingCategory.isDeleted) {
            throw new AppError(
                409,
                "A deleted category already exists with this name/slug. Please restore it instead.",
            );
        }

        throw new AppError(409, "Category with this name already exists");
    }

    // If parentId is provided, verify parent category
    if (parentId) {
        const parentCategory = await prisma.category.findFirst({
            where: {
                id: parentId,
                isDeleted: false,
            },
        });

        if (!parentCategory) {
            throw new AppError(404, "Parent category not found");
        }
    }

    const category = await prisma.category.create({
        data: {
            name: name.trim(),
            slug: formattedSlug,
            parentId: parentId || null,
        },
    });

    return category;
};

const updateCategory = async (id: string, payload: updateCategoryPayload) => {
    const { name, slug, parentId } = payload;

    // Check if category exists
    const existingCategory = await prisma.category.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });

    if (!existingCategory) {
        throw new AppError(404, "Category not found");
    }

    // Format slug if provided
    const formattedSlug = slug
        ? slug.trim().toLowerCase().replace(/\s+/g, "-")
        : undefined;

    // Check slug uniqueness if slug is being updated
    if (formattedSlug && formattedSlug !== existingCategory.slug) {
        const existingSlug = await prisma.category.findUnique({
            where: {
                slug: formattedSlug,
            },
        });

        if (existingSlug) {
            throw new AppError(409, "Category with this slug already exists");
        }
    }

    // If parentId is provided, validate parent category
    if (parentId) {
        // Prevent category from being its own parent
        if (parentId === id) {
            throw new AppError(400, "A category cannot be its own parent");
        }

        const parentCategory = await prisma.category.findFirst({
            where: {
                id: parentId,
                isDeleted: false,
            },
        });

        if (!parentCategory) {
            throw new AppError(404, "Parent category not found");
        }
    }

    const updatedCategory = await prisma.category.update({
        where: {
            id,
        },
        data: {
            ...(name !== undefined && {
                name: name.trim(),
            }),

            ...(formattedSlug !== undefined && {
                slug: formattedSlug,
            }),

            ...(parentId !== undefined && {
                parentId: parentId || null,
            }),
        },
    });

    return updatedCategory;
};

const deleteCategory = async (id: string) => {
    // Check if category exists
    const existingCategory = await prisma.category.findFirst({
        where: { id },
    });

    if (!existingCategory || existingCategory.isDeleted) {
        throw new AppError(404, "Category not found");
    }

    const result = await prisma.category.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return result;
};

const restoreCategory = async (id: string) => {
    const existingCategory = await prisma.category.findFirst({
        where: { id },
    });

    if (!existingCategory) {
        throw new AppError(404, "Category not found");
    }

    // check if category is already active
    if (!existingCategory.isDeleted) {
        throw new AppError(400, "Category is already Active");
    }

    const result = await prisma.category.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });

    return result;
};

export const CategoryService = {
    getAllCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
};
