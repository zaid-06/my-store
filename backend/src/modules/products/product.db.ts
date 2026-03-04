import { db } from "../../config/db";
import { and, eq, isNull ,count } from "drizzle-orm";
import { products, productVariants, productMedia } from "./product.schema";
import { categories } from "./product.schema";
/* ========== PRODUCTS ========== */

export const dbGetPublishedProductsByStoreId = (storeId: string) => {
  return db.query.products.findMany({
    where: (p, { and, eq, isNull }) =>
      and(
        eq(p.storeId, storeId),
        eq(p.status, "published"),
        isNull(p.deletedAt)
      ),
  });
};



// Create product

export const  insertProduct = async (data: {
  storeId: string;
  title: string;
  description?: string | null;
  isFeatured?: boolean;
}) => {
  const [row] = await db
    .insert(products)
    .values({
      storeId: data.storeId,
      title: data.title,
      description: data.description ?? null,
      status: "draft",
      isFeatured: data.isFeatured ?? false,
    })
    .returning();

  return row;
};



export const listCategoriesByStore = async (storeId: string) => {
  return db
    .select()
    .from(categories)
    .where(eq(categories.storeId, storeId));
};


export const getProductsByStore = async (storeId: string) => {
   return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        isNull(products.deletedAt)
      )
    );
};


export const findProductById = async (productId: string) => {
   return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, productId),
        isNull(products.deletedAt)
      )
    );
};

export const findProductByIdAndStoreId = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {
  const [product] = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId),
        isNull(products.deletedAt)
      )
    );

  return product ?? null;
};






// src/modules/products/product.db.ts


/**
 * Get product by id + store (ownership check)
 */
export const findProductByIdAndStore = async (
  productId: string,
  storeId: string
) => {
  return await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

/**
 * Update product
 */
export const updateProductById = async (
  productId: string,
  data: any
) => {
  const [updated] = await db
    .update(products)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  return updated ?? null;
};

/**
 * Get variants by product
 */
export const findVariantsByProductId = async (productId: string) => {
  return await db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
  });
};

/**
 * Get media by product
 */
export const findMediaByProductId = async (productId: string) => {
  return await db.query.productMedia.findMany({
    where: eq(productMedia.productId, productId),
  });
};





export const softDeleteProductDB = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {
  const [row] = await db
    .update(products)
    .set({
      deletedAt: new Date(),
    })
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId),
        isNull(products.deletedAt)
      )
    )
    .returning();

  return row ?? null;
};



// src/modules/products/product.db.ts

/**
 * Check if product exists, belongs to store, and is not deleted
 */
export const findProductForVariantInsert = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {
  return await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

/**
 * Insert variant
 */
export const insertVariant = async ({
  productId,
  name,
  price,
  inventory,
}: {
  productId: string;
  name: string;
  price: string;
  inventory: number;
}) => {
  const [variant] = await db
    .insert(productVariants)
    .values({
      productId,
      name,
      price,
      inventory,
    })
    .returning();

  return variant;
};


/**
 * Check product ownership & not deleted
 */
export const findProductForVariantUpdate = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {
  return await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

/**
 * Update variant by id
 */
export const updateVariantById = async ({
  productId,
  variantId,
  name,
  price,
  inventory,
}: {
  productId: string;
  variantId: string;
  name?: string;
  price?: number;
  inventory?: number;
}) => {
  const [updated] = await db
    .update(productVariants)
    .set({
      name,
      price: price !== undefined ? price.toString() : undefined,
      inventory,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(productVariants.id, variantId),
        eq(productVariants.productId, productId)
      )
    )
    .returning();

  return updated ?? null;
};



// check product ownership + not deleted
export const findProductForVariantDelete = async (
  productId: string,
  storeId: string
) => {
  return await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

// get variants by product
export const getVariantsByProductId = async (productId: string) => {
  return await db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
  });
};

// delete variant
export const deleteVariantById = async (
  productId: string,
  variantId: string
) => {
  await db
    .delete(productVariants)
    .where(
      and(
        eq(productVariants.id, variantId),
        eq(productVariants.productId, productId)
      )
    );
};




export const findProductForMediaAdd = async (
  productId: string,
  storeId: string
) => {
  return db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

// export const countProductMedia = async (productId: string) => {
//   const [{ value }] = await db
//     .select({ value: count() })
//     .from(productMedia)
//     .where(eq(productMedia.productId, productId));

//   return value;
// };

export const countProductMedia = async (productId: string): Promise<number> => {
  const [{ value }] = await db
    .select({ value: count() })
    .from(productMedia)
    .where(eq(productMedia.productId, productId));

  return Number(value ?? 0);
};
// export const countProductMedia = async (productId: string) => {
//   const [{ value }] = await db
//     .select({ value: count() })
//     .from(productMedia)
//     .where(eq(productMedia.productId, productId));

//   return Number(value ?? 0);
// };
// src/modules/products/product.db.ts

// export const countProductMedia = async (productId: string): Promise<number> => {
//   const [{ value }] = await db
//     .select({ value: count() })
//     .from(productMedia)
//     .where(eq(productMedia.productId, productId));

//   return Number(value ?? 0);
// };

export const insertProductMedia = async (data: {
  productId: string;
  url: string;
  type: "image" | "video";
  position: number;
}) => {
  const [media] = await db
    .insert(productMedia)
    .values(data)
    .returning();

  return media;
};


// product.db.ts

export const findProductForMediaRemoval = async (
  productId: string,
  storeId: string
) => {
  return await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

export const deleteProductMedia = async (
  productId: string,
  mediaId: string
) => {
  return await db
    .delete(productMedia)
    .where(
      and(
        eq(productMedia.id, mediaId),
        eq(productMedia.productId, productId)
      )
    )
    .returning();
};



export const findPublishedProductsByStoreId = async (storeId: string) => {
  return db.query.products.findMany({
    where: (products, { eq, and, isNull }) =>
      and(
        eq(products.storeId, storeId),
        eq(products.status, "published"),
        isNull(products.deletedAt)
      ),
    with: {
      variants: true,
      media: true,
    },
  });
};










export const dbGetSinglePublishedProduct = ({
  storeId,
  productId,
}: {
  storeId: string;
  productId: string;
}) => {
  return db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      eq(products.status, "published"),
      isNull(products.deletedAt)
    ),
  });
};

/* ========== VARIANTS ========== */

export const dbGetVariantsByProductId = (productId: string) => {
  return db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
  });
};

/* ========== MEDIA ========== */

export const dbGetMediaByProductId = (productId: string) => {
  return db.query.productMedia.findMany({
    where: eq(productMedia.productId, productId),
    orderBy: (m, { asc }) => [asc(m.position)],
  });
};

// import { db } from "../../config/db";
// import { and, eq } from "drizzle-orm";


// 🔎 Read
export const findCategoryByStoreAndName = async (
  storeId: string,
  name: string
) => {
  return db.query.categories.findFirst({
    where: and(
      eq(categories.storeId, storeId),
      eq(categories.name, name)
    ),
  });
};

// ✍️ Write
export const insertCategory = async (data: {
  storeId: string;
  name: string;
}) => {
  const [row] = await db
    .insert(categories)
    .values(data)
    .returning();

  return row;
};






/**
 * Find product for publishing (ownership + not deleted)
 */
export const findProductForPublish = async ({
  productId,
  storeId,
}: {
  productId: string;
  storeId: string;
}) => {
  return await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.storeId, storeId),
      isNull(products.deletedAt)
    ),
  });
};

/**
 * Count product variants
 */
export const countProductVariants = async (productId: string) => {
  const variants = await db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
  });

  return variants.length;
};



/**
 * Update product status
 */
export const updateProductStatus = async ({
  productId,
  status,
}: {
  productId: string;
  status: "draft" | "published";
}) => {
  const [updated] = await db
    .update(products)
    .set({ status })
    .where(eq(products.id, productId))
    .returning();

  return updated;
};