import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as storeService from "../stores/store.service";
import * as productService from "./product.service";
import { productSchema } from "./product.schema";
import { auth } from "../auth/auth.config";

export const createProductController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  if (!store) {
    return res.status(400).json({ error: "You must have a store to create products" });
  }

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { title, description, isFeatured } = parsed.data;
  const product = await productService.createProduct({
    storeId: store.id,
    title,
    description,
    isFeatured,
  });

  return res.status(201).json(product);
};