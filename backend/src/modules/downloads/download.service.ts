// import { downloadRepository } from "./download.db";
import { db } from "../../config/db";
import { digitalDownloads } from "./download.schema";
import { generateDownloadToken } from "../../shared/generateDownloadToken";

import { getDownloadsForProduct } from "./download.db";

import { Request } from "express";
import {
  getDownloadByToken,
  getProductFile,
  incrementDownloadCount,
  logDownload,
} from "./download.db";

export const getDownloadService = async (token: string, req: Request) => {

  // 1 validate token
  const record = await getDownloadByToken(token);

  if (!record) {
    throw new Error("Invalid download token");
  }

  if (!record?.order) {
  throw new Error("Order not found");
}
  // 2 validate order status
  if (record?.order?.status as string === "CANCELLED") {
    throw new Error("Order cancelled");
  }
  if (record?.order?.status !== "PAID") {
    throw new Error("Order not paid");
  }

  

  // 3 expiry check
  if (record.expiresAt && new Date() > record.expiresAt) {
    throw new Error("Download expired");
  }

  // 4 max download check
  if (
    record.maxDownloads !== null &&
    record.downloadCount >= record.maxDownloads
  ) {
    throw new Error("Download limit reached");
  }

  // 5 get product file
  const file = await getProductFile(record.productId);

  if (!file) {
    throw new Error("File not found");
  }

  // 6 increment count
  await incrementDownloadCount(record.id, record.downloadCount);

  // 7 log download
  await logDownload(
    record.id,
    req.ip || "",
    req.headers["user-agent"] || ""
  );

  // 8 return url
  return file.url;
};


export const createDigitalDownload = async (
  orderId: string,
  productId: string,
  variantId: string
) => {

  const token = generateDownloadToken();

  await db.insert(digitalDownloads).values({
    orderId,
    productId,
    variantId,
    token,
    maxDownloads: null,
    expiresAt: null
  });

};


export const listProductDownloadsService = async (
  productId: string,
  storeId: string
) => {
  const downloads = await getDownloadsForProduct(productId, storeId);

  return downloads;
};


import { getAllDigitalDownloads } from "./download.db";

export const listAllDownloadsService = async () => {
  const downloads = await getAllDigitalDownloads();
  return downloads;
};