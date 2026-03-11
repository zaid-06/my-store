import { listProductDownloadsService } from "./download.service";
import { Request, Response } from "express";
import { getDownloadService } from "./download.service";

import { listAllDownloadsService } from "./download.service";


export const downloadController = async (req: Request, res: Response) => {
  const { token } = req.params;

  const url = await getDownloadService(token as string, req);

  return res.json({
    success: true,
    url,
  });
};


import * as storeService from "../stores/store.service";
import { auth } from "../auth/auth.config";
import { fromNodeHeaders } from "better-auth/node";

export const listProductDownloadsController = async (
  req: Request,
  res: Response
) => {
  const productId = req.params.id;

  // const storeId = req.user?.id;

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

 const downloads = await listProductDownloadsService(
  productId as string,
  store.id
);


  res.json({
    success: true,
    data: downloads,
  });
};


export const listAllDownloadsController = async (
  req: Request,
  res: Response
) => {

  const downloads = await listAllDownloadsService();

  res.json({
    success: true,
    data: downloads,
  });

};