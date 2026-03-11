// import { db } from "@/config/db";
import { and, eq, isNull, gte, lte } from "drizzle-orm";
// import { products } from "@/modules/products/product.schema";
// import { productVariants } from "@/modules/products/product.schema";
import { stores } from "../stores/store.schema";
import { buyers} from "./order.schema";
import {  orders } from "./order.schema";


// import { and, eq, gte, lte, isNull } from "drizzle-orm";
// import { orders } from "./order.schema";
import { db } from "../../config/db";
// import { and, eq, isNull ,count } from "drizzle-orm";
import { products, productVariants, productMedia } from "../products/product.schema";
// import { categories } from "./product.schema";

// PRODUCT


export const findPublishedProductForOrder = async (productId: string) => {
  return db.query.products.findFirst  ({
    where: and(
      eq(products.id, productId),
      eq(products.status, "published"),
      isNull(products.deletedAt)
    ),
  });
};

  //  STORE


export const findStoreById = async (storeId: string) => {
  return db.query.stores.findFirst({
    where: eq(stores.id, storeId),
  });
};



// VARIANT
export const findVariantForOrder = async (
  variantId: string,
  productId: string
) => {
  return db.query.productVariants.findFirst({
    where: and(
      eq(productVariants.id, variantId),
      eq(productVariants.productId, productId)
    ),
  });
};

// BUYER

export const findBuyerByEmailAndPhone = async (
  email: string,
  phone: string
) => {
  return db.query.buyers.findFirst({
    where: and(eq(buyers.email, email), eq(buyers.phone, phone)),
  });
};

export const createBuyer = async (data: {
  email: string;
  phone: string;
  name: string;
}) => {
  const [buyer] = await db.insert(buyers).values(data).returning();
  return buyer;
};

// ORDER
export const insertOrder = async (data: any) => {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
};



type ListOrdersFilters = {
  storeId: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
};

export const findOrdersByStore = async ({
  storeId,
  status,
  startDate,
  endDate,
}: ListOrdersFilters) => {
  const conditions = [
    eq(orders.storeId, storeId),
    isNull(orders.deletedAt),
  ];

  if (status) {
    conditions.push(eq(orders.status, status as any));
  }

  if (startDate) {
    conditions.push(gte(orders.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(orders.createdAt, endDate));
  }

  return db.query.orders.findMany({
    where: and(...conditions),
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });
};

export const findOrderById = async (orderId: string) => {
  return db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      isNull(orders.deletedAt)
    ),
  });
};


export const findOrderByIdAndStore = async (
  orderId: string,
  storeId: string
) => {
  return db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      eq(orders.storeId, storeId),
      isNull(orders.deletedAt)
    ),
  });
};

// export const updateOrderStatus = async (
//   orderId: string,
//   status:  "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "RETURNED" | "CANCELLED"
// ) => {
//   const [updated] = await db
//     .update(orders)
//     .set({ status, updatedAt: new Date() })
//     .where(eq(orders.id, orderId))
//     .returning();

//   return updated;
// };



// export const updateOrderStatus = async (
//   orderId: string,
//   status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "RETURNED" | "CANCELLED"
// ) => {

//   // 1️⃣ update status
//   await db
//     .update(orders)
//     .set({ status, updatedAt: new Date() })
//     .where(eq(orders.id, orderId));

//   // 2️⃣ fetch order with product relation
//   const updatedOrder = await db.query.orders.findFirst({
//     where: eq(orders.id, orderId),
//     with: {
//       product: true
//     }
//   });

//   return updatedOrder;
// };

import { createDigitalDownload } from "../downloads/download.service";

export const updateOrderStatus = async (
  orderId: string,
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "RETURNED" | "CANCELLED"
) => {

  // 1️⃣ update order
  await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // 2️⃣ fetch order with product relation
  const updatedOrder = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      product: true
    }
  });

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  /*
  Business Rules
  */

  // ONLINE payment
  if (
    updatedOrder.product?.productType === "DIGITAL" &&
    updatedOrder.paymentMethod === "ONLINE" &&
    updatedOrder.status === "PAID"
  ) {

    await createDigitalDownload(
      updatedOrder.id,
      updatedOrder.productId,
      updatedOrder.variantId
    );
  }

 

  return updatedOrder;
};












export const softDeleteOrder = async (orderId: string) => {
  const [updated] = await db
    .update(orders)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updated;
};

// export const updateOrderRefund = async (
//   orderId: string,
//   refundAmount: number
// ) => {
//   const [updated] = await db
//     .update(orders)
//     .set({
//       isRefunded: true,
//       refundAmount ,
//       updatedAt: new Date(),
//     })
//     .where(eq(orders.id, orderId))
//     .returning();

//   return updated;
// };

export const updateOrderRefund = async (
  orderId: string,
  refundAmount: number
) => {
  const [updated] = await db
    .update(orders)
    .set({
      isRefunded: true,

      // Convert to fixed 2 decimal string (safe for numeric column)
      refundAmount: refundAmount.toFixed(2),

      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updated;
};  




// import { and, eq, gte, lte, isNull } from "drizzle-orm";
// import { db } from "@/config/db";
// import { orders } from "./order.schema";

type AdminOrderFilter = {
  status?: string;
  startDate?: Date;
  endDate?: Date;
};

export const findAllOrders = async ({
  status,
  startDate,
  endDate,
}: AdminOrderFilter) => {
  const conditions = [isNull(orders.deletedAt)];

  if (status) {
    conditions.push(eq(orders.status, status as any));
  }

  if (startDate) {
    conditions.push(gte(orders.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(orders.createdAt, endDate));
  }

  return db.query.orders.findMany({
    where: and(...conditions),
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });
};

