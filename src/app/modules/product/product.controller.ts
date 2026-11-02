import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { VARIANT_IMAGE_PREFIX } from "./product.helpers";
import { ProductServices } from "./product.service";
import { createProductSchema, updateProductSchema } from "./product.validation";

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    // storefront: only ACTIVE, non-deleted products
    const result = await ProductServices.getAllProducts(
        req.query as IQueryParams,
        {
            publicOnly: true,
        },
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getAllProductsForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        // admin panel: every status (DRAFT, ACTIVE, ARCHIVED), non-deleted
        const result = await ProductServices.getAllProducts(
            req.query as IQueryParams,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Products retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    },
);

const createProduct = catchAsync(async (req: Request, res: Response) => {
    let rawData: unknown;
    try {
        rawData = JSON.parse(req.body.data);
    } catch {
        throw new AppError(
            status.BAD_REQUEST,
            "`data` must be a valid JSON string",
        );
    }

    const payload = createProductSchema.parse(rawData);

    const uploadedFiles = (req.files ?? []) as (UploadFile & {
        fieldname: string;
    })[];

    const files: Record<string, UploadFile[]> = {};

    for (const file of uploadedFiles) {
        const field = file.fieldname;

        // upload.any() accepts every field name, so reject the ones we don't use
        if (
            field !== "productImages" &&
            !field.startsWith(VARIANT_IMAGE_PREFIX)
        ) {
            throw new AppError(
                status.BAD_REQUEST,
                `Unexpected file field "${field}"`,
            );
        }

        (files[field] ??= []).push(file);
    }

    const result = await ProductServices.createProduct(payload, files);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Product created successfully",
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = updateProductSchema.parse(JSON.parse(req.body.data));

    const uploadedFiles = (req.files ?? []) as (UploadFile & {
        fieldname: string;
    })[];

    const files: Record<string, UploadFile[]> = {};

    for (const file of uploadedFiles) {
        (files[file.fieldname] ??= []).push(file);
    }

    const result = await ProductServices.updateProduct(
        id as string,
        payload,
        files,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product updated successfully",
        data: result,
    });
});

// const deleteProduct = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;

//     const result = await ProductServices.deleteProduct(id as string);

//     sendResponse(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "Product deleted successfully",
//         data: result,
//     });
// });

// const restoreProduct = catchAsync(async (req: Request, res: Response) => {
//     const { id } = req.params;

//     const result = await ProductServices.restoreProduct(id as string);

//     sendResponse(res, {
//         httpStatusCode: status.OK,
//         success: true,
//         message: "Product restored successfully",
//         data: result,
//     });
// });

export const ProductController = {
    getAllProducts,
    getAllProductsForAdmin,
    createProduct,
    updateProduct,
};
