import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { createProductSchema } from "./playgound.validation";
import { createProductServ, getAllProductsServ } from "./playground";
import { VARIANT_IMAGE_PREFIX } from "./product.helpers";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
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

    const result = await createProductServ(payload, files);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Product created successfully",
        data: result,
    });
});

export const getAllProducts = catchAsync(
    async (req: Request, res: Response) => {
        // storefront: only ACTIVE, non-deleted products
        const result = await getAllProductsServ(req.query as IQueryParams, {
            publicOnly: true,
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Products retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    },
);

export const getAllProductsForAdmin = catchAsync(
    async (req: Request, res: Response) => {
        // admin panel: every status (DRAFT, ACTIVE, ARCHIVED), non-deleted
        const result = await getAllProductsServ(req.query as IQueryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Products retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    },
);
