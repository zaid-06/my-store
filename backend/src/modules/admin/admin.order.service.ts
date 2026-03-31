import * as orderDb from "../orders/order.db";
import { ApiError } from "../../shared/api-error";
import * as adminAuditLogDb from "./admin-audit.db";
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

// export const adminOverrideOrderStatus = async ({
//   orderId,
//   status,
// }: AdminOverrideStatusInput) => {

//   //  Check order exists
//   const order = await orderDb.findOrderById(orderId);

//   if (!order) {
//     throw new ApiError("Order not found", 404);
//   }

//   // Direct update (no transition validation)
//   const updated = await orderDb.updateOrderStatus(
//     orderId,
//     status as any
//   );

//   return updated;
// };

export const adminOverrideOrderStatus = async ({
  orderId,
  status,
  adminId,
}: {
  orderId: string;
  status: string;
  adminId: string;
}) => {
  //  Get existing order (for BEFORE state)
  const existingOrder = await orderDb.findOrderById(orderId);

  if (!existingOrder) {
    throw new ApiError("Order not found", 404);
  }

  const previousStatus = existingOrder.status;

  //  Update order
  const updated = await orderDb.updateOrderStatus(orderId, status as any);

  await adminAuditLogDb.createLog({
    adminId,
    action: "ORDER_STATUS_OVERRIDE",
    entityType: "ORDER",
    entityId: orderId,
    metadata: {
      before: {
        status: previousStatus,
      },
      after: {
        status,
      },
    },
  });

  return updated;
};



export const adminSoftDeleteOrder = async (orderId: string) => {

  //  Check order exists
  const order = await orderDb.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  //  Soft delete
  const deleted = await orderDb.softDeleteOrder(orderId);

  return deleted;
};
