import { db } from "../../config/db";
import { products } from "./product.schema";

export const createProduct = async (data: {
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