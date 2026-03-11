// src/modules/products/product.routes.ts

import { Router } from "express";
import { Role } from "../../types/roles";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import {
  createProductController,
  createCategoryController,
  listCategoriesController,
  getOwnProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  addVariantController,
  updateVariantController,
  deleteVariantController,
  addMediaController,
  removeMediaController,
  // listPublishedProductsByStoreController,
} from "./product.controller";
import { listProductDownloadsController } from "../downloads/download.controller";

export const productRoutes = Router();

// CREATE PRODUCT
productRoutes.post(
  "/",
  requireAuth,
  requireRole(Role.CREATOR),
  createProductController
);

// GET OWN PRODUCTS (Dashboard)
productRoutes.get(
  "/",
  requireAuth,
  requireRole(Role.CREATOR),
  getOwnProductsController
);

// CREATE CATEGORY
productRoutes.post(
  "/categories",
  requireAuth,
  requireRole(Role.CREATOR),
  createCategoryController
);

// LIST CATEGORIES
productRoutes.get(
  "/categories",
  requireAuth,
  requireRole(Role.CREATOR),
  listCategoriesController
);

// GET SINGLE PRODUCT (OWNER)
productRoutes.get(
  "/:id",
  requireAuth,
  requireRole(Role.CREATOR),
  getSingleProductController
);

productRoutes.patch(
  "/:id",
  requireAuth,
  requireRole(Role.CREATOR),
  updateProductController
);

// DELETE PRODUCT (SOFT)
productRoutes.delete(
  "/:id",
  requireAuth,
  requireRole(Role.CREATOR),
  deleteProductController
);

// ADD VARIANT
productRoutes.post(
  "/:id/variants",
  requireAuth,
  requireRole(Role.CREATOR),
  addVariantController
);

// UPDATE VARIANT
productRoutes.patch(
  "/:id/variants/:variantId",
  requireAuth,
  requireRole(Role.CREATOR),
  updateVariantController
);

// product.routes.ts
productRoutes.delete(
  "/:id/variants/:variantId",
  requireAuth,
  requireRole(Role.CREATOR),
  deleteVariantController
);

// product.routes.ts
productRoutes.post(
  "/:id/media",
  requireAuth,
  requireRole(Role.CREATOR),
  addMediaController
);
// product.routes.ts
productRoutes.delete(
  "/:id/media/:mediaId",
  requireAuth,
  requireRole(Role.CREATOR),
  removeMediaController
);


productRoutes.get(
  "/:id/downloads",
  requireAuth,
  requireRole(Role.CREATOR),
  listProductDownloadsController
);



// console.log("username.####################");
