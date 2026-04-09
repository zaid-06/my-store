import { db } from "../../config/db";
import { digitalDownloads, downloadLogs } from "./download.schema";
import { eq , and } from "drizzle-orm";



import { products } from "../products/product.schema";


import { productMedia } from "../products/product.schema";

export const getDownloadByToken = async (token: string) => {
  return db.query.digitalDownloads.findFirst({
    where: eq(digitalDownloads.token, token),
    with: {
      order: true,
    },
  });
};

// get file media for product
export const getProductFile = async (productId: string) => {
  return db.query.productMedia.findFirst({
    where: and(
      eq(productMedia.productId, productId),
      eq(productMedia.type, "file")
    ),
  });
};

// increment download count
export const incrementDownloadCount = async (
  downloadId: string,
  currentCount: number
) => {
  await db
    .update(digitalDownloads)
    .set({ downloadCount: currentCount + 1 })
    .where(eq(digitalDownloads.id, downloadId));
};

// log download
export const logDownload = async (
  digitalDownloadId: string,
  ipAddress: string,
  userAgent: string
) => {
  await db.insert(downloadLogs).values({
    digitalDownloadId,
    ipAddress,
    userAgent,
  });
};


export const getDownloadsForProduct = async (
  productId: string,
  storeId: string
) => {
  return db
    .select({
      orderId: digitalDownloads.orderId,
      downloadCount: digitalDownloads.downloadCount,
      createdAt: digitalDownloads.createdAt,
    })
    .from(digitalDownloads)
    .innerJoin(products, eq(products.id, digitalDownloads.productId))
    .where(
      and(
        eq(digitalDownloads.productId, productId),
        eq(products.storeId , storeId)
      )
    );
};


export const getAllDigitalDownloads = async () => {
  return db
    .select({
      orderId: digitalDownloads.orderId,
      productId: digitalDownloads.productId,
      downloadCount: digitalDownloads.downloadCount,
      createdAt: digitalDownloads.createdAt,
    })
    .from(digitalDownloads);
};

export const findDownloadByOrderAndProduct = async (
  orderId: string,
  productId: string
) => {
  return await db.query.digitalDownloads.findFirst({
    where: (d, { eq, and }) =>
      and(eq(d.orderId, orderId), eq(d.productId, productId)),
  });
};
export const insertDownload = async (data: {
  orderId: string;
  productId: string;
  variantId: string;
  token: string;
}) => {
  const [download] = await db
    .insert(digitalDownloads)
    .values({
      ...data,
      maxDownloads: null,
      expiresAt: null,
    })
    .returning();

  return download;
};