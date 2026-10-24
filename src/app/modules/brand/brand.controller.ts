import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BrandServices } from "./brand.service";
import { createBrandSchema, updateBrandSchema } from "./brand.validation";

const getAllBrand = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await BrandServices.getAllBrand(query as IQueryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Brands fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getBrandById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BrandServices.getBrandbyId(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Brand by Id fetched successfully",
        data: result,
    });
});

const createBrand = catchAsync(async (req: Request, res: Response) => {
    const payload = createBrandSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    const result = await BrandServices.createBrand(payload, files);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Brand created successfully",
        data: result,
    });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = updateBrandSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    const result = await BrandServices.updateBrand(
        id as string,
        payload,
        files,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Brand updated successfully",
        data: result,
    });
});

const deleteBrand = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BrandServices.deleteBrand(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Brand deleted successfully",
        data: result,
    });
});

const restoreBrand = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BrandServices.restoreBrand(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Brand restored successfully",
        data: result,
    });
});

export const BrandController = {
    getAllBrand,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    restoreBrand,
};
