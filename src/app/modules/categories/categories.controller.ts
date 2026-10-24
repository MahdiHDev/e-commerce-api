import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./categories.services";
import {
    createCategorySchema,
    updateCategorySchema,
} from "./categories.validation";

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await CategoryService.getAllCategory(query as IQueryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Categories fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.getCategoryById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category by Id fetched successfully",
        data: result,
    });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = createCategorySchema.parse(req.body);
    const result = await CategoryService.createCategory(payload);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Category Created successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = updateCategorySchema.parse(req.body);

    const result = await CategoryService.updateCategory(id as string, payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category Updated Successfully",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.deleteCategory(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category Deleted Successfully",
        data: result,
    });
});

const restoreCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CategoryService.restoreCategory(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Category Restored Successfully",
        data: result,
    });
});

export const CategoryController = {
    getAllCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
};
