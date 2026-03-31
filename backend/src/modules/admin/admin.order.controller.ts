import { Request, Response } from "express";
import { 
  listAdminOrders, 
  adminOverrideOrderStatus, 
  adminSoftDeleteOrder

} from "./admin.order.service";

import { successResponse } from "../../shared/response";
import { ApiError } from "../../shared/api-error";
import { markOrderRefund } from "../orders/order.service";

export const adminMarkOrderRefundController = async (
  req: Request,
  res: Response
) => {
  const adminId = req.user!.id;

  const { id } = req.params as { id: string };
  const { refundAmount } = req.body;

  const updatedOrder = await markOrderRefund({
    userId: adminId,
    role: "ADMIN", //  force admin role
    orderId: id,
    refundAmount: Number(refundAmount),
  });

  return res.json(successResponse(updatedOrder));
};


export const listAdminOrdersController = async (
  req: Request,
  res: Response
) => {
  const { status, startDate, endDate } = req.query;

  const orders = await listAdminOrders({
    status: status as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  return res.json(successResponse(orders));

};


export const adminOverrideOrderStatusController = async (
  req: Request,
  res: Response
) => {
  const adminId = req.user!.id;
  const orderId = req.params.id as string;
  const { status } = req.body;
  if (!status) {
    throw new ApiError("Status is required", 400);
  }
  const updated = await adminOverrideOrderStatus({
    orderId,
    status,
    adminId,
  });
  return res.json(successResponse(updated));
};




export const adminSoftDeleteOrderController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const deleted = await adminSoftDeleteOrder(id as string);
  return res.json(successResponse(deleted));

};