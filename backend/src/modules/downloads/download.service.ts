// import { downloadRepository } from "./download.db";
import { db } from "../../config/db";
import { digitalDownloads } from "./download.schema";
import { generateDownloadToken } from "../../shared/generateDownloadToken";
import { ApiError } from "../../shared/api-error";
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
    throw new ApiError("Invalid download token", 404);
  }

  if (!record.order) {
    throw new ApiError("Order not found", 404);
  }

  // 2 validate order status
  if (record.order.status === "CANCELLED") {
    throw new ApiError("Order cancelled", 400);
  }


  const total = Number(record.order.totalAmount);
  const refunded = Number(record.order.refundAmount || 0);

  if (refunded >= total) {
    throw new ApiError(
      "Download not allowed for fully refunded order",
      403
    );
  }
  if (record.order.status !== "PAID") {
    throw new ApiError("Order not paid", 400);
  }


  // 3 expiry check
  if (record.expiresAt && new Date() > record.expiresAt) {
    throw new ApiError("Download expired", 410);
  }

  // 4 max download check
  if (
    record.maxDownloads !== null &&
    record.downloadCount >= record.maxDownloads
  ) {
    throw new ApiError("Download limit reached", 403);
  }

  // 5 get product file
  const file = await getProductFile(record.productId);

  if (!file) {
    throw new ApiError("File not found", 404);
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