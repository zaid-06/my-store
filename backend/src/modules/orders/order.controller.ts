import { Request, Response } from "express";
import { createOrderSchema } from "./order.schema";
import {
  createOrder,
  getCreatorOrder,
  updateCreatorOrderStatus,
  markOrderRefund 
 } from "./order.service";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.config";


export const createOrderController = async (
  req: Request,
  res: Response
) => {
  // 1️⃣ Validate input
  const parsed = createOrderSchema.parse(req.body);

  // 2️⃣ Call service
  const result = await createOrder(parsed);

  return res.status(201).json({
    success: true,
    data: result,
    error: null,
  });
};



// import { Request, Response } from "express";
import { listCreatorOrders } from "./order.service";
import { session } from "auth-schema";
import { id } from "zod/v4/locales";

export const getCreatorOrdersController = async (
  req: Request,
  res: Response
) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    console.log("User ID:.....................", session?.user.id)
    // console.log("Req User:", req.user)
  
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }


  // const creatorId = req.user.id; // from auth middleware
  const creatorId = session?.user.id
// const creatorId = "jz3FlwHSKoB9FG1vCkO0KnNaEtU2bzya";
  const { status, startDate, endDate } = req.query;

  const orders = await listCreatorOrders({
    creatorId,
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







export const getCreatorOrderController = async (
  req: Request,
  res: Response
) => {

   const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    console.log("User ID:.....................", session?.user.id)
    // console.log("Req User:", req.user)
  
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  // const creatorId = req.user.id; // from auth middleware
  const creatorId = session?.user.id
  // const creatorId = req.user.id;



  // const { id } = req.params;
  const id = req.params.id as string;


  const order = await getCreatorOrder({
    creatorId,
    orderId: id,
  });

  res.json({
    success: true,
    data: order,
    error: null,
  });
};



export const updateOrderStatusController = async (
  req: Request,
  res: Response
) => {

  const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    console.log("User ID:.....................", session?.user.id)
    // console.log("Req User:", req.user)
  
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  // const creatorId = req.user.id; // from auth middleware
  const creatorId = session?.user.id
  // const creatorId = req.user.id;




  
  // const creatorId = req.user.id;
  // const { id } = req.params;

  const id = req.params.id as string;

  const { status } = req.body;

  const updatedOrder = await updateCreatorOrderStatus({
    creatorId,
    orderId: id,
    newStatus: status,
  });

  res.json({
    success: true,
    data: updatedOrder,
    error: null,
  });
};




export const markOrderRefundController = async (
  req: Request,
  res: Response
) => {
  // User already set by requireAuth middleware
  const user = req.user;

  if (!user?.id || !user?.role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params as { id: string };
  const { refundAmount } = req.body;

  const updatedOrder = await markOrderRefund({
    userId: user.id,
    role: user.role as "CREATOR" | "ADMIN",
    orderId: id,
    refundAmount: Number(refundAmount),
  });

  res.json({
    success: true,
    data: updatedOrder,
    error: null,
  });
};