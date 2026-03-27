import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as storeService from "../stores/store.service";
import * as productService from "./product.service";
import { productSchema ,categorySchema, updateProductSchema, mediaSchema} from "./product.schema";
import { auth } from "../auth/auth.config";
import { variantSchema } from "./product.schema";

// Create Product Controller

export const createProductController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({
      error: "You must have a store to create products",
    });
  }

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const product = await productService.createProduct({
    storeId: store.id,
    ...parsed.data,
  });

  return res.status(201).json(product);
};






// Category Controller
export const createCategoryController = async (
  req: Request,
  res: Response
) => {
  // 1 Auth
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2 Store check
  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({
      error: "You must have a store to create categories",
    });
  }

  // 3 Validation
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  // 4 Business call
  const category = await productService.createCategory(
    store.id,
    parsed.data.name
  );

  return res.status(201).json({
    success: true,
    data: category,
    error: null,
  });
};


// Get All Categories 
export const listCategoriesController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);

  if (!store) {
    return res.status(400).json({
      error: "You must have a store to view categories",
    });
  }

  const categories = await productService.listCategoriesByStore(store.id);

  return res.json({
    success: true,
    data: categories,
    error: null,
  });
};



export const getOwnProductsController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const products = await productService.getProductsByStore(store.id);

  return res.json(products);
};


// Get single product controller 
export const getSingleProductController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const productId = req.params.id as string;

  const product = await productService.getProductByIdForOwner({
    productId,
    storeId: store.id,
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  return res.json(product);
};

// updateProductController
export const updateProductController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const productId = req.params.id as string;

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%')
  try {
    const product = await productService.updateProductByIdForOwner({
      productId: productId,
      storeId: store.id,
      data: parsed.data,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (err: any) {
    return res.status(400).json({
      error: err.message ?? "Update failed",
    });
  }

};
// Delete Product  Controller
// export const deleteProductController = async (
//   req: Request,
//   res: Response
// ) => {
//   const session = await auth.api.getSession({
//     headers: fromNodeHeaders(req.headers),
//   });

//   if (!session?.user?.id) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const store = await storeService.getStoreByUserId(session.user.id);
//   if (!store) {
//     return res.status(400).json({ error: "Store not found" });
//   }

//   const productId = req.params.id as string;

//   const deleted = await productService.softDeleteProduct({
//     productId,
//     storeId: store.id,
//   });

//   if (!deleted) {
//     return res.status(404).json({ error: "Product not found" });
//   }

//   return res.json({
//     success: true,
//     message: "Product deleted successfully",
//   });
// };

export const deleteProductController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);

  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const productId = req.params.id as string;

  await productService.softDeleteProduct({
    productId,
    storeId: store.id,
  });

  return res.json({
    success: true,
    message: "Product deleted successfully",
  });
};


// Add Variant Controller
export const addVariantController = async (req: Request, res: Response) => {
  // 1. session check
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2. get store
  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  // 3. validate body
  const parsed = variantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  // 4. productId from params
  const productId = req.params.id as string;

  // 5. ownership + create variant
  const variant = await productService.addVariantToProduct({
    productId,
    storeId: store.id,
    ...parsed.data,
  });

  if (!variant) {
    return res.status(404).json({ error: "Product not found or not owned" });
  }

  return res.status(201).json(variant);


};

// Update Variant Controller

export const updateVariantController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;

  //  validate body
  const parsed = variantSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const updatedVariant = await productService.updateVariant({
    productId,
    variantId,
    storeId: store.id,
    ...parsed.data,
  });

  if (!updatedVariant) {
    return res.status(404).json({ error: "Variant not found" });
  }

  return res.json(updatedVariant);
};

// Delete Variant Controller

export const deleteVariantController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const productId = req.params.id as string;
  const variantId = req.params.variantId as string;

  const result = await productService.deleteVariant({
    productId,
    variantId,
    storeId: store.id,
  });

  if (result === "NOT_FOUND") {
    return res.status(404).json({ error: "Variant not found" });
  }

  if (result === "LAST_VARIANT_PUBLISHED") {
    return res.status(400).json({
      error: "Cannot delete last variant of a published product",
    });
  }
  return res.status(200).json({
  message: "DELET",
});
};

// Add Media Controller
export const addMediaController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const parsed = mediaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const productId = req.params.id as string;

   try {
    const media = await productService.addMediaToProduct({
      productId ,
      storeId: store.id,
      ...parsed.data,
    });

    if (!media) {
      return res.status(400).json({
        error: "Cannot add media (limit reached or product not found)",
      });
    }

    return res.status(201).json(media);

  } catch (err: any) {
    return res.status(400).json({
      error: err.message ?? "Failed to add media",
    });
  }
};



export const removeMediaController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "Store not found" });
  }

  const productId = req.params.id as string;
  const mediaId = req.params.mediaId as string;

  const deleted = await productService.removeMediaFromProduct({
    productId,
    mediaId,
    storeId: store.id,
  });

  if (!deleted) {
    return res.status(404).json({
      error: "Media not found or product not owned",
    });
  }

  return res.status(200).json({
    message: "MEDIA_DELETED",
  });
};

// Remove Media Contlist Published Products By Store Controller
export const listPublishedProductsByStoreController = async (
  req: Request<{ username: string }>,
  res: Response
) => {
  
  const { username } = req.params;

  console.log("username..........................,,,,,,,,,,,,,,,,", username);
  // 1. Find store by username
  const store = await storeService.getStoreByUsername(username);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  // 2. Fetch published products
  const products = await productService.getPublishedProductsByStoreId(
    store.id
  );

  return res.json(products);
};

// product.controller.ts
export const getSinglePublishedProductController = async (
  req: Request,
  res: Response
) => {
  const { username, productId } = req.params;

  // Store lookup (controller responsibility)
  const store = await storeService.getStoreByUsername(username as string);

  if (!store || !store.isPublic) {
    return res.status(404).json({ error: "Store not found" });
  }

  //  Call service with IDs only
  const product =
    await productService.getSinglePublishedProductByStoreAndId({
      storeId: store.id,
      productId: productId as string,
    });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  return res.json(product);
};

