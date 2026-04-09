// src/modules/products/product.routes.ts

import { Router } from "express";
import { requireAuth} from "../auth/auth.middleware";
import {requireMerchant} from "../../middlewares/requireMerchant";
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
  requireMerchant,
  createProductController
);

// GET OWN PRODUCTS (Dashboard)
productRoutes.get(
  "/",
  requireAuth,
  requireMerchant,
  getOwnProductsController
);

// CREATE CATEGORY
productRoutes.post(
  "/categories",
  requireAuth,
  requireMerchant,
  createCategoryController
);

// LIST CATEGORIES
productRoutes.get(
  "/categories",
  requireAuth,
  listCategoriesController
);

// GET SINGLE PRODUCT (OWNER)
productRoutes.get(
  "/:id",
  requireAuth,
  requireMerchant,
  getSingleProductController
);

productRoutes.patch(
  "/:id",
  requireAuth,
  requireMerchant,
  updateProductController
);

// DELETE PRODUCT (SOFT)
productRoutes.delete(
  "/:id",
  requireAuth,
  requireMerchant,
  deleteProductController
);

// ADD VARIANT
productRoutes.post(
  "/:id/variants",
  requireAuth,
  requireMerchant,
  addVariantController
);

// UPDATE VARIANT
productRoutes.patch(
  "/:id/variants/:variantId",
  requireAuth,
  requireMerchant,
  updateVariantController
);
// product.routes.ts
productRoutes.delete(
  "/:id/variants/:variantId",
  requireAuth,
  requireMerchant,
  deleteVariantController
);

// product.routes.ts
productRoutes.post(
  "/:id/media",
  requireAuth,
  requireMerchant,
  addMediaController
);
// product.routes.ts
productRoutes.delete(
  "/:id/media/:mediaId",
  requireAuth,
  requireMerchant,
  removeMediaController
);


productRoutes.get(
  "/:id/downloads",
  requireAuth,
  requireMerchant,
  listProductDownloadsController
);



