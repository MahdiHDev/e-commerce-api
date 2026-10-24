import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { CategoryController } from "./categories.controller";

const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), CategoryController.getAllCategory);
router.get(
    "/:id",
    checkAuth(UserRole.ADMIN),
    CategoryController.getCategoryById,
);

router.post("/", checkAuth(UserRole.ADMIN), CategoryController.createCategory);

router.patch(
    "/restore/:id",
    checkAuth(UserRole.ADMIN),
    CategoryController.restoreCategory,
);

router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN),
    CategoryController.updateCategory,
);

router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN),
    CategoryController.deleteCategory,
);

export const CategoryRoutes: Router = router;
