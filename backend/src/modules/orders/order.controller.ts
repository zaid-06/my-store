import { Request, Response } from "express";
import { createOrderSchema } from "./order.schema";
import {
  createOrder,
  getCreatorOrder,
  updateCreatorOrderStatus,
  markOrderRefund 
 } from "./order.service";

import { successResponse } from "../../shared/response";

export const createOrderController = async (
  req: Request,
  res: Response
) => {
  // 1 Validate input
  const parsed = createOrderSchema.parse(req.body);

  // 2 Call service
  const result = await createOrder(parsed);

  return res.status(201).json(successResponse(result));
};



// import { Request, Response } from "express";
import { listCreatorOrders } from "./order.service";
// import { session } from "auth-schema";
import { id } from "zod/v4/locales";

export const getCreatorOrdersController = async (
  req: Request,
  res: Response
) => {
  const creatorId = req.user!.id;

  const { status, startDate, endDate } = req.query;

  const orders = await listCreatorOrders({
    creatorId,
    status: status as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  });

  return res.json(successResponse(orders));
};


export const getCreatorOrderController = async (
  req: Request,
  res: Response
) => {
  const creatorId = req.user!.id;

  const orderId = req.params.id as string;

  const order = await getCreatorOrder({
    creatorId,
    orderId,
  });

  return res.json(successResponse(order));
};



export const updateOrderStatusController = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.id;

  const orderId = req.params.id as string;
  const { status } = req.body;

  const updatedOrder = await updateCreatorOrderStatus({
    creatorId: userId,
    orderId,
    newStatus: status,
  });

  return res.json(successResponse(updatedOrder));
};

export const markOrderRefundController = async (
  req: Request,
  res: Response
) => {
  const { id: orderId } = req.params as { id: string };
  const { refundAmount } = req.body;

  const updatedOrder = await markOrderRefund({
    userId: req.user!.id,
    role: req.user!.role as "CREATOR" | "ADMIN",
    orderId,
    refundAmount: Number(refundAmount),
  });

  return res.json(successResponse(updatedOrder));
};