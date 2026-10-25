import { Brand, Prisma } from "../../../generated/client";
import { prisma } from "../../../lib/prisma";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { brandFilterableFields, brandSearchableFields } from "./brand.constant";
import { CreateBrandPayload, updateBrandPayload } from "./brand.validation";

type BrandWithCount = Prisma.BrandGetPayload<{
    include: {
        _count: {
            select: {
                products: true;
            };
        };
    };
}>;

const getAllBrand = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        Brand,
        Prisma.BrandWhereInput,
        Prisma.BrandInclude
    >(prisma.brand, query, {
        searchableFields: brandSearchableFields,
        filterableFields: brandFilterableFields,
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            _count: {
                select: {
                    products: true,
                },
            },
        })
        .paginate()
        .sort()
        .fields()
        .execute();

    const brands = result.data as unknown as BrandWithCount[];

    return {
        data: brands.map(({ _count, ...brand }) => ({
            ...brand,
            products: _count.products,
        })),
        meta: result.meta,
    };
};

const getBrandbyId = async (id: string) => {
    const result = await prisma.brand.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(404, "Brand not found");
    }

    const { _count, ...brand } = result;

    return {
        ...brand,
        products: _count.products,
    };
};

const createBrand = async (
    payload: CreateBrandPayload,
    files?: Record<string, UploadFile[]>,
) => {
    const { name, slug, description } = payload;
    const brandLogoFile = files?.brandLogo?.[0];

    // Upload a new logo only when provided
    const brandLogo = brandLogoFile
        ? await CloudinaryService.upload(brandLogoFile, {
              folder: CloudinaryFolders.brand.brandLogo,
          })
        : null;

    const uploadedPublicIds: string[] = brandLogo?.public_id
        ? [brandLogo.public_id]
        : [];

    try {
        const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

        const existingBrand = await prisma.brand.findFirst({
            where: {
                slug: formattedSlug,
            },
        });

        if (existingBrand) {
            if (existingBrand.isDeleted) {
                throw new AppError(
                    409,
                    "A deleted brand with this slug already exists. Please restore it instead.",
                );
            }

            throw new AppError(409, "A brand with this slug already exists.");
        }

        const result = await prisma.brand.create({
            data: {
                name: name.trim(),
                slug: formattedSlug,
                ...(description && { description }),
                ...(brandLogo && {
                    logoUrl: brandLogo.secure_url,
                    logoUrlName: brandLogoFile?.originalname as string,
                    logoUrlPublicId: brandLogo.public_id,
                    logoUrlType: brandLogoFile?.mimetype as string,
                }),
            },
        });

        return result;
    } catch (error) {
        // Roll back the newly uploaded image if the operation fails
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const updateBrand = async (
    id: string,
    payload: updateBrandPayload,
    files?: Record<string, UploadFile[]>,
) => {
    const { name, slug, description } = payload;

    // Check if brand exists
    const existingBrand = await prisma.brand.findFirst({
        where: {
            id,
            isDeleted: false,
        },
    });

    if (!existingBrand) {
        throw new AppError(404, "Brand not found");
    }

    // Format slug if provided
    const formattedSlug = slug
        ? slug.trim().toLowerCase().replace(/\s+/g, "-")
        : undefined;

    // Check slug uniqueness if slug is changed
    if (formattedSlug && formattedSlug !== existingBrand.slug) {
        const existingSlug = await prisma.brand.findFirst({
            where: {
                slug: formattedSlug,
                id: {
                    not: id,
                },
            },
        });

        if (existingSlug) {
            if (existingSlug.isDeleted) {
                throw new AppError(
                    409,
                    "A deleted brand with this slug already exists. Please restore it instead.",
                );
            }

            throw new AppError(409, "A brand with this slug already exists.");
        }
    }

    const brandLogoFile = files?.brandLogo?.[0];

    // Upload a new logo only when provided
    const brandLogo = brandLogoFile
        ? await CloudinaryService.upload(brandLogoFile, {
              folder: CloudinaryFolders.brand.brandLogo,
          })
        : null;

    const uploadedPublicIds: string[] = brandLogo?.public_id
        ? [brandLogo.public_id]
        : [];

    try {
        const result = await prisma.brand.update({
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

                ...(description !== undefined && {
                    description: description.trim(),
                }),

                ...(brandLogo && {
                    logoUrl: brandLogo.secure_url,
                    logoUrlName: brandLogoFile?.originalname as string,
                    logoUrlPublicId: brandLogo.public_id,
                    logoUrlType: brandLogoFile?.mimetype as string,
                }),
            },
        });

        // Delete the old logo only after the database update succeeds
        if (brandLogo && existingBrand.logoUrlPublicId) {
            await CloudinaryService.delete(existingBrand.logoUrlPublicId);
        }

        return result;
    } catch (error) {
        // Roll back the newly uploaded image if the operation fails
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const deleteBrand = async (id: string) => {
    const existingBrand = await prisma.brand.findFirst({
        where: {
            id,
        },
    });

    if (!existingBrand || existingBrand.isDeleted) {
        throw new AppError(404, "Brand not found!");
    }

    const result = await prisma.brand.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return result;
};

const restoreBrand = async (id: string) => {
    const existingBrand = await prisma.brand.findFirst({
        where: {
            id,
        },
    });

    if (!existingBrand) {
        throw new AppError(404, "Brand not found");
    }

    if (!existingBrand.isDeleted) {
        throw new AppError(400, "Brand is already active");
    }

    const result = await prisma.brand.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });

    return result;
};

export const BrandServices = {
    getAllBrand,
    getBrandbyId,
    createBrand,
    updateBrand,
    deleteBrand,
    restoreBrand,
};
