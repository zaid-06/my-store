

import { ApiError } from "../../shared/api-error";
import { assertStoreNotSuspended} from "../../guards/store.guard";
import {findProductByIdAndStoreId} from "./product.db";
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

  //  TASK 9 RULE
  const store = await storeDb.dbGetStoreById(data.storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  assertStoreNotSuspended(store);

  // optional but good (already handled in some flows)
  if (!store.isPublic) {
    throw new ApiError("Store is private", 400);
  }

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

  console.log("Checking if category exists for storeId:", storeId, "and name:", name, "Result:", exists);

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
  
  const product = await findProductByIdAndStoreId({
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
      throw new Error("Cannot publish product without variants");
    }

    if (media.length === 0) {
      throw new Error("Cannot publish product without media");
    }

    if (variants.some((v) => v.inventory < 0)) {
      throw new Error("Variant inventory cannot be negative");
    }
    if (product.productType === "DIGITAL") {
      // const fileMedia = media.filter((m) => m.type === "file");
      // if (fileMedia.length === 0) {
      //   throw new Error("Cannot publish digital product without file media");
      // }

        const hasFile = media.some((m) => m.type === "file");

      if (!hasFile) {
        
        throw new Error(
          'DIGITAL products must have at least 1 media item of type "file"'
        );
      }
    }
  }

  //  Update
  return await updateProductById(productId, data);
};




// export const softDeleteProduct = async ({
//   productId,
//   storeId,
// }: {
//   productId: string;
//   storeId: string;
// }) => {
//    //  Check ownership
//   // const product = await findProductByIdAndStore({
//   //   productId,
//   //   storeId,
//   // });

//   // if (!product) return null;

//   // //  Already deleted
//   // if (product.deletedAt) return null;
//   return await softDeleteProductDB({ productId, storeId });
// };

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
  //  Product ownership & existence check
  const product = await productDb.findProductForVariantInsert({
    productId,
    storeId,
  }); 

  if (!product) {
    return null;
  }

  //  Insert variant
  const variant = await productDb.insertVariant({
    productId,
    name,
    price: price.toString(), // decimal → string
    inventory,
  });


if (!variant) return null;

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
  //  Check product ownership
  const product = await findProductForVariantUpdate({
    productId,
    storeId,
  });

  if (!product) {
    return null; // controller will return 404
  }

  //  Update variant
  const updatedVariant = await updateVariantById({
    productId,
    variantId,
    name,
    price,
    inventory,
  });

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
  if (!product) return "NOT_FOUND";

  // Variant count
  const variants = await getVariantsByProductId(productId);
  const isLastVariant = variants.length === 1;

  //  Business rule
  if (product.status === "published" && isLastVariant) {
    return "LAST_VARIANT_PUBLISHED";
  }
  //  NEW: CHECK IF VARIANT USED IN ORDERS
  const hasOrders = await orderDb.hasOrdersForVariant(variantId);

  if (hasOrders) {
    return "VARIANT_IN_USE";
  }


  //  Delete variant
  await deleteVariantById(productId, variantId);

  return "DELETED";
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
  //  Product ownership + not deleted
  const product = await findProductForMediaAdd(productId, storeId);
  if (!product) return null;

  //  Media count rule
  if (product.productType === "PHYSICAL" && type === "file") {
    throw new Error("PHYSICAL products cannot have media of type file");
  }
  const mediaCount = await countProductMedia(productId);
  if (mediaCount >= 10) {
    throw new Error("Maximum 10 media items allowed per product");
  }

  //  Insert media
  const media = await insertProductMedia({
    productId,
    url,
    type ,
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
  //  Product ownership + not deleted
  const product = await findProductForMediaRemoval(productId, storeId);
  if (!product) return false;

  // Delete media
  const result = await deleteProductMedia(productId, mediaId);
  if (result.length === 0) return false;

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
  //  Product
  const product = await dbGetSinglePublishedProduct({
    storeId,
    productId,
  });

  if (!product) return null;

  //  Relations
  const [variants, media] = await Promise.all([
    dbGetVariantsByProductId(product.id),
    dbGetMediaByProductId(product.id),
  ]);

  //PBLIC VISIBILITY RULE
  if (variants.length === 0 || media.length === 0) {
    return null;
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
  //  ownership + existence
  const product = await productDb.findProductForPublish({
    productId,
    storeId,
  });

  if (!product) return null;

  //  must have at least 1 variant
  const variantCount = await productDb.countProductVariants(productId);
  if (variantCount === 0) return null;

  //  must have at least 1 media
  const mediaCount = await productDb.countProductMedia(productId);
  if (mediaCount === 0) return null;

  //  update status
  return await productDb.updateProductStatus({
    productId,
    status: "published",
  });
};