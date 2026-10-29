import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProductServices } from "./product.service";
import { createProductSchema, updateProductSchema } from "./product.validation";

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const payload = createProductSchema.parse(JSON.parse(req.body.data));

    const uploadedFiles = req.files as (UploadFile & {
        fieldname: string;
    })[];

    const files: Record<string, UploadFile[]> = {};

    for (const file of uploadedFiles) {
        const fieldFiles = files[file.fieldname] ?? [];

        fieldFiles.push(file);

        files[file.fieldname] = fieldFiles;
    }

    const result = await ProductServices.createProduct(payload, files);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product created successfully",
        data: result,
    });
});

const updateProduct = catchAsync(async (req, res) => {
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

export const ProductController = { createProduct, updateProduct };
