import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { ProductController } from "./product.controller";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.ADMIN),
    // upload.fields([
    //     { name: "productImages", maxCount: 10 },
    //     { name: "variantImages_TSHIRT-BLACK-M", maxCount: 5 },
    //     { name: "variantImages_TSHIRT-BLACK-L", maxCount: 5 },
    //     { name: "variantImages_TSHIRT-WHITE-M", maxCount: 5 },
    // ]),
    upload.any(),
    ProductController.createProduct,
);

router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN),
    upload.any(),
    ProductController.updateProduct,
);

router.patch(
    "/restore/:id",
    checkAuth(UserRole.ADMIN),
    ProductController.restoreProduct,
);

router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN),
    ProductController.deleteProduct,
);

export const ProductRoutes: Router = router;
