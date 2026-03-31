import { listProductDownloadsService } from "./download.service";
import { Request, Response } from "express";
import { getDownloadService } from "./download.service";

import { listAllDownloadsService } from "./download.service";
import { successResponse } from "../../shared/response";
import { ApiError } from "../../shared/api-error";

import * as storeService from "../stores/store.service";


export const downloadController = async (req: Request, res: Response) => {
  const { token } = req.params;

  const url = await getDownloadService(token as string, req);

  return res.json(successResponse(url));

};



export const listProductDownloadsController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;
  const productId = req.params.id as string;
  const store = await storeService.getStoreByUserId(userId);
  if (!store) {
    throw new ApiError("Store not found", 400);
  }
  const downloads = await listProductDownloadsService(
    productId,
    store.id
  );

  return res.json(successResponse(downloads));
};


export const listAllDownloadsController = async (
  req: Request,
  res: Response
) => {

  const downloads = await listAllDownloadsService();

  return res.json(successResponse(downloads));
};