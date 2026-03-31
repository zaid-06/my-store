

import { ApiError } from "../../shared/api-error";
import { assertStoreNotSuspended} from "../../guards/store.guard";
import { findProductByIdAndStoreId} from "./product.db";
import {
  products,
  categories,
  productVariants,
  productMedia,
  UpdateProductInput ,
} from "./product.schema";

import {
  findProductByIdAndStore,
  updateProductById,
  findVariantsByProductId,
  findMediaByProductId,
  dbGetSinglePublishedProduct,
  dbGetVariantsByProductId,
  dbGetMediaByProductId,
  softDeleteProductDB ,
  findProductForVariantUpdate,
  updateVariantById,
  findProductForVariantDelete,
  getVariantsByProductId,
  deleteVariantById,
  findProductForMediaAdd,
  countProductMedia,
  insertProductMedia,
  findProductForMediaRemoval,
  deleteProductMedia,
  findActiveProductByIdAndStoreId,
} from "./product.db";


// product.service.ts
import * as productDb from "./product.db";

import * as storeDb from "../stores/store.db";
import * as orderDb from "../orders/order.db";
export const createProduct = async (data: {
  storeId: string;
  title: string;
  description?: string | null;
  isFeatured?: boolean;
  productType: "PHYSICAL" | "DIGITAL";
}) => {
  const store = await storeDb.dbGetStoreById(data.storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  assertStoreNotSuspended(store);

  if (store.deletedAt) {
    throw new ApiError("Store is deleted", 400);
  }

  
  // Prevent weird edge case
  // if (!data.title?.trim()) {
  //   throw new ApiError("Product title is required", 400);
  // }

  return productDb.insertProduct(data);
};

export const createCategory = async (
    storeId: string,
    name: string
  ) => {
    //  Business rule: no duplicate category
    const exists = await productDb.findCategoryByStoreAndName(
      storeId,
      name
    );
    if (exists) {
      throw new ApiError("Category already exists", 400);
    }

    //  Create
    return productDb.insertCategory({
      storeId,
      name,
    });
};


export const listCategoriesByStore = async (storeId: string) => {
  

  return productDb.listCategoriesByStore(storeId);
};


// get all product 
export const getProductsByStore = async (storeId: string) => {
 
  return productDb.getProductsByStore(storeId);
};



// Get single product controller 


export const getProductByIdForOwner = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {

  // apply rule 
  
  const product = await findActiveProductByIdAndStoreId({
    productId,
    storeId,
  });

  return product; 
};




export const updateProductByIdForOwner = async ({
  productId,
  storeId,
  data,
}: {
  productId: string;
  storeId: string;
  data: UpdateProductInput;
}) => {
  //  Ownership + existence check

  //  TASK 9 RULE
  const store = await storeDb.dbGetStoreById(storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  assertStoreNotSuspended(store);
  const product = await findProductByIdAndStore(productId, storeId);
  if (!product) return null;

  //  Publishing rules
  if (data.status === "published") {
    const variants = await findVariantsByProductId(productId);
    const media = await findMediaByProductId(productId);

    if (variants.length === 0) {
      throw new ApiError(
        "Cannot publish product without variants",
        400
      );
    }

    if (media.length === 0) {
      throw new ApiError(
        "Cannot publish product without media",
        400
      );
    }

    if (variants.some((v) => v.inventory < 0)) {
      throw new ApiError(
        "Variant inventory cannot be negative",
        400
      );
    }

    if (product.productType === "DIGITAL") {
      const hasFile = media.some((m) => m.type === "file");

      if (!hasFile) {
        throw new ApiError(
          'DIGITAL products must have at least 1 media item of type "file"',
          400
        );
      }
    }
  }

  //  Update
  return await updateProductById(productId, data);
};






export const softDeleteProduct = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {

  //  Check ownership
  const product = await productDb.findProductByIdAndStoreId({
    productId,
    storeId,
  });

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // 2 Already deleted
  if (product.deletedAt) {
    throw new ApiError("Product already deleted", 400);
  }

  // CHECK: active orders
  const orders = await orderDb.findActiveOrdersByProductId(productId);

  if (orders.length > 0) {
    throw new ApiError(
      "Cannot delete product with active orders",
      400
    );
  }

  //  Soft delete
  return await softDeleteProductDB({ productId, storeId });
};






export const addVariantToProduct = async ({
  productId,
  storeId,
  name,
  price,
  inventory,
}: {
  productId: string;
  storeId: string;
  name: string;
  price: number;
  inventory: number;
}) => {
  // Ownership check
  const product = await productDb.findProductForVariantInsert({
    productId,
    storeId,
  });
  if (!product) {
    throw new ApiError("Product not found or not owned", 404);
  }
  // Insert variant
  const variant = await productDb.insertVariant({
    productId,
    name,
    price: price.toString(),
    inventory,
  });

  return {
    ...variant,
    price: Number(variant.price).toFixed(2),
  };
};




export const updateVariant = async ({
  productId,
  variantId,
  storeId,
  name,
  price,
  inventory,
}: {
  productId: string;
  variantId: string;
  storeId: string;
  name?: string;
  price?: number;
  inventory?: number;
}) => {
  // Ownership check
  const product = await findProductForVariantUpdate({
    productId,
    storeId,
  });

  if (!product) {
    throw new ApiError("Product not found or not owned", 404);
  }

  const updatedVariant = await updateVariantById({
    productId,
    variantId,
    name,
    price,
    inventory,
  });

  if (!updatedVariant) {
    throw new ApiError("Variant not found", 404);
  }

  return updatedVariant;
};

export const deleteVariant = async ({
  productId,
  variantId,
  storeId,
}: {
  productId: string;
  variantId: string;
  storeId: string;
}) => {
  //  Product ownership check
  const product = await findProductForVariantDelete(productId, storeId);

  if (!product) {
    throw new ApiError("Variant not found", 404);
  }

  //  Variant count
  const variants = await getVariantsByProductId(productId);
  const isLastVariant = variants.length === 1;

  if (product.status === "published" && isLastVariant) {
    throw new ApiError(
      "Cannot delete last variant of a published product",
      400
    );
  }

  //  Check if variant used in orders
  const hasOrders = await orderDb.hasOrdersForVariant(variantId);

  if (hasOrders) {
    throw new ApiError(
      "Cannot delete variant with active orders",
      400
    );
  }

  //  Delete variant
  await deleteVariantById(productId, variantId);

  return { message: "Variant deleted successfully" };
};



export const addMediaToProduct = async ({
  productId,
  storeId,
  url,
  type,
  position,
}: {
  productId: string;
  storeId: string;
  url: string;
  type: "image" | "video" | "file";
  position?: number;
}) => {
  const product = await findProductForMediaAdd(productId, storeId);

  if (!product) {
    throw new ApiError("Product not found or not owned", 404);
  }

  //  Business rules
  if (product.productType === "PHYSICAL" && type === "file") {
    throw new ApiError(
      "PHYSICAL products cannot have media of type file",
      400
    );
  }

  const mediaCount = await countProductMedia(productId);

  if (mediaCount >= 10) {
    throw new ApiError(
      "Maximum 10 media items allowed per product",
      400
    );
  }

  const media = await insertProductMedia({
    productId,
    url,
    type,
    position: position ?? mediaCount,
  });

  return media;
};




export const removeMediaFromProduct = async ({
  productId,
  mediaId,
  storeId,
}: {
  productId: string;
  mediaId: string;
  storeId: string;
}) => {
  const product = await findProductForMediaRemoval(productId, storeId);

  if (!product) {
    throw new ApiError("Product not found or not owned", 404);
  }

  const result = await deleteProductMedia(productId, mediaId);

  if (result.length === 0) {
    throw new ApiError("Media not found", 404);
  }

  return true;
};


export const getPublishedProductsByStoreId = async (storeId: string) => {
  const products = await productDb.findPublishedProductsByStoreId(storeId);

  const visibleProducts = [];

  for (const product of products) {
    const [variants, media] = await Promise.all([
      productDb.dbGetVariantsByProductId(product.id),
      productDb.dbGetMediaByProductId(product.id),
    ]);

    if (variants.length > 0 && media.length > 0) {
      visibleProducts.push({
        ...product,
        variants,
        media,
      });
    }
  }

  return visibleProducts;
};

// ````

export const getSinglePublishedProductByStoreAndId = async ({
  storeId,
  productId,
}: {
  storeId: string;
  productId: string;
}) => {
  const product = await dbGetSinglePublishedProduct({
    storeId,
    productId,
  });

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  const [variants, media] = await Promise.all([
    dbGetVariantsByProductId(product.id),
    dbGetMediaByProductId(product.id),
  ]);

  // Public visibility rule
  if (variants.length === 0 || media.length === 0) {
    throw new ApiError("Product not found", 404);
  }

  return {
    ...product,
    variants,
    media,
  };
};



// testing 
import { db } from "@/config/db";

import { eq, and } from "drizzle-orm";

type AddVariantInput = {
  productId: string;
  storeId: string;
  name: string;
  price: number;
  inventory: number;
};





export const publishProduct = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {
  //  Store validation (Task 9)
  const store = await storeDb.dbGetStoreById(storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  assertStoreNotSuspended(store);

  //  Ownership + existence
  const product = await productDb.findProductForPublish({
    productId,
    storeId,
  });

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  //  Business rules

  const variantCount = await productDb.countProductVariants(productId);
  if (variantCount === 0) {
    throw new ApiError(
      "Cannot publish product without variants",
      400
    );
  }

  const mediaCount = await productDb.countProductMedia(productId);
  if (mediaCount === 0) {
    throw new ApiError(
      "Cannot publish product without media",
      400
    );
  }

  // (Optional but strong rule)
  if (product.status === "published") {
    throw new ApiError("Product already published", 400);
  }

  // Update
  return await productDb.updateProductStatus({
    productId,
    status: "published",
  });
};