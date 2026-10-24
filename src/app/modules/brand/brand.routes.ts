import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { BrandController } from "./brand.controller";

const router = Router();

router.get("/", BrandController.getAllBrand);
router.get("/:id", BrandController.getBrandById);

router.post(
    "/",
    checkAuth(UserRole.ADMIN),
    upload.fields([
        {
            name: "brandLogo",
            maxCount: 1,
        },
    ]),
    BrandController.createBrand,
);

router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN),
    upload.fields([
        {
            name: "brandLogo",
            maxCount: 1,
        },
    ]),
    BrandController.updateBrand,
);

router.delete("/:id", checkAuth(UserRole.ADMIN), BrandController.deleteBrand);
router.patch(
    "/restore/:id",
    checkAuth(UserRole.ADMIN),
    BrandController.restoreBrand,
);

export const BrandRoutes: Router = router;
