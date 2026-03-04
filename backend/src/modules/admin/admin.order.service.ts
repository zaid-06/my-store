import * as orderDb from "../orders/order.db";
import { ApiError } from "../../shared/api-error";

type ListAdminOrdersInput = {
  status?: string;
  startDate?: string;
  endDate?: string;
};

export const listAdminOrders = async ({
  status,
  startDate,
  endDate,
}: ListAdminOrdersInput) => {

  const parsedStartDate = startDate
    ? new Date(startDate)
    : undefined;

  const parsedEndDate = endDate
    ? new Date(endDate)
    : undefined;

  const orders = await orderDb.findAllOrders({
    status,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  });

  return orders;
};



type AdminOverrideStatusInput = {
  orderId: string;
  status: string;
};

export const adminOverrideOrderStatus = async ({
  orderId,
  status,
}: AdminOverrideStatusInput) => {

  // 1️⃣ Check order exists
  const order = await orderDb.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // 2️⃣ Direct update (no transition validation)
  const updated = await orderDb.updateOrderStatus(
    orderId,
    status as any
  );

  return updated;
};



export const adminSoftDeleteOrder = async (orderId: string) => {

  // 1️⃣ Check order exists
  const order = await orderDb.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // 2️⃣ Soft delete
  const deleted = await orderDb.softDeleteOrder(orderId);

  return deleted;
};
