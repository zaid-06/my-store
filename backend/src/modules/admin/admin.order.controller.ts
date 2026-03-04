import { Request, Response } from "express";
import { 
  listAdminOrders, 
  adminOverrideOrderStatus, 
  adminSoftDeleteOrder 
} from "./admin.order.service";


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

  res.json({
    success: true,
    data: orders,
    error: null,
  });
};


export const adminOverrideOrderStatusController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Status is required",
    });
  }

  const updated = await adminOverrideOrderStatus({
    orderId: id as string,
    status,
  });

  res.json({
    success: true,
    data: updated,
    error: null,
  });
};




export const adminSoftDeleteOrderController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const deleted = await adminSoftDeleteOrder(id as string);

  res.json({
    success: true,
    data: deleted,
    error: null,
  });
};