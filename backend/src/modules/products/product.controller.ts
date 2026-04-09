import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as storeService from "../stores/store.service";
import * as productService from "./product.service";
import { productSchema ,categorySchema, updateProductSchema, mediaSchema} from "./product.schema";
import { auth } from "../auth/auth.config";
import { variantSchema } from "./product.schema";
import { successResponse } from "../../shared/response";
import { ApiError } from "../../shared/api-error";
// Create Product Controller


export const createProductController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);

  if (!store) {
    throw new ApiError(
      "You must have a store to create products",
      400
    );
  }

  const parsed = productSchema.parse(req.body); // use parse (not safeParse)

  const product = await productService.createProduct({
    storeId: store.id,
    ...parsed,
  });

  return res.status(201).json(successResponse(product));
};




// Category Controller
export const createCategoryController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError(
      "You must have a store to create categories",
      400
    );
  }

  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      parsed.error.issues[0].message,
      400
    );
  }

  const category = await productService.createCategory(
    store.id,
    parsed.data.name
  );

  return res.status(201).json(successResponse(category));
};


// Get All Categories 
export const listCategoriesController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);

  if (!store) {
    throw new ApiError("You must have a store to view categories",400);
  }

  const categories = await productService.listCategoriesByStore(
    store.id
  );

  return res.json(successResponse(categories)); //  200 by default
};



export const getOwnProductsController = async (req: Request, res: Response) => {
   const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }
  const products = await productService.getProductsByStore(store.id);

  return res.status(200).json(successResponse(products));
};


// Get single product controller 
export const getSingleProductController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  const productId = req.params.id as string;

  const product = await productService.getProductByIdForOwner({
    productId,
    storeId: store.id,
  });

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  return res.json(successResponse(product));
};

// updateProductController
export const updateProductController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  const productId = req.params.id as string;

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.message, 400);
  }

  const product = await productService.updateProductByIdForOwner({
    productId,
    storeId: store.id,
    data: parsed.data,
  });

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  return res.status(200).json(successResponse(product));
};


export const deleteProductController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;
  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }
  const productId = req.params.id as string;
  await productService.softDeleteProduct({
    productId,
    storeId: store.id,
  });

  return res.json(
    successResponse({
      message: "Product deleted successfully",
    })
  );
};


// Add Variant Controller
export const addVariantController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  const parsed = variantSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      parsed.error.issues[0].message,
      400
    );
  }

  const productId = req.params.id as string;

  const variant = await productService.addVariantToProduct({
    productId,
    storeId: store.id,
    ...parsed.data,
  });

  return res.status(201).json(successResponse(variant));
};

// Update Variant Controller

export const updateVariantController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;

  const parsed = variantSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      parsed.error.issues[0].message,
      400
    );
  }

  const updatedVariant = await productService.updateVariant({
    productId,
    variantId,
    storeId: store.id,
    ...parsed.data,
  });

  return res.json(successResponse(updatedVariant)); //  200
};

// Delete Variant Controller

export const deleteVariantController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);

  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;

  const result = await productService.deleteVariant({
    productId,
    variantId,
    storeId: store.id,
  });

  return res.json(successResponse(result));
};
// Add Media Controller
export const addMediaController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  const parsed = mediaSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      parsed.error.issues[0].message,
      400
    );
  }

  const productId = req.params.id as string;

  const media = await productService.addMediaToProduct({
    productId,
    storeId: store.id,
    ...parsed.data,
  });

  return res.status(201).json(successResponse(media));
};


export const removeMediaController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const store = await storeService.getMyStoreService(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  const productId = req.params.id as string;
  const mediaId = req.params.mediaId as string;

  await productService.removeMediaFromProduct({
    productId,
    mediaId,
    storeId: store.id,
  });

  return res.json(
    successResponse({ message: "MEDIA_DELETED" })
  );
};


export const listPublishedProductsByStoreController = async (
  req: Request<{ username: string }>,
  res: Response
) => {
  const { username } = req.params;

  const store = await storeService.getStoreByUsername(username);

  //  FIX: enforce public visibility
  if (
    !store ||
    !store.isPublic ||
    store.deletedAt ||
    store.isSuspended
  ) {
    throw new ApiError("Store not found", 404);
  }
  
  const products =
    await productService.getPublishedProductsByStoreId(store.id);
  return res.json(successResponse(products));
};

// product.controller.ts
export const getSinglePublishedProductController = async (
  req: Request,
  res: Response
) => {
  const { username, productId } = req.params;

  const store = await storeService.getStoreByUsername(username as string);

  // Task 9: treat suspended/private as NOT FOUND
  if (!store || !store.isPublic || store.isSuspended) {
    throw new ApiError("Store not found", 404);
  }

  const product =
    await productService.getSinglePublishedProductByStoreAndId({
      storeId: store.id,
      productId: productId as string,
    });

  return res.json(successResponse(product));
};

