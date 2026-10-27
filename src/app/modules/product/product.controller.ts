import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProductServices } from "./product.service";
import { createProductSchema } from "./product.validation";

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const payload = createProductSchema.parse(JSON.parse(req.body.data));

    const files = req.files as Record<string, UploadFile[]>;

    const result = await ProductServices.createProduct(payload, files);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Product created successfully",
        data: result,
    });
});

export const ProductController = { createProduct };
