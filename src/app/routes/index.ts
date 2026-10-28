import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { BrandRoutes } from "../modules/brand/brand.routes";
import { CategoryRoutes } from "../modules/categories/categories.routes";
import { ProductRoutes } from "../modules/product/product.routes";

const routes: ExpressRouter = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/categories",
        route: CategoryRoutes,
    },
    {
        path: "/brands",
        route: BrandRoutes,
    },
    {
        path: "/product",
        route: ProductRoutes,
    },
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;
