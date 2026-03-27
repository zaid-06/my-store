// import { ApiError } from "@/shared/api-error";
import { ApiError } from "../../shared/api-error";
import * as orderDb from "./order.db";
import { dbGetStoreByUserId } from "../stores/store.db";
import * as jobDb from "../jobs/job.db"; 
import { createPayoutForOrderService } from "../payouts/payout.service";
type CreateOrderInput = {
  productId: string;
  variantId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: any;
  paymentMethod: "ONLINE" | "COD";
};
import { adjustPayoutAfterRefund } from "../payouts/payout.service";
export const createOrder = async (input: CreateOrderInput) => {
  const {
    productId,
    variantId,
    quantity,
    buyerName,
    buyerEmail,
    buyerPhone,
    shippingAddress,
    paymentMethod,
  } = input;

// Product Validation
  const product = await orderDb.findPublishedProductForOrder(productId);

  if (!product) {
    throw new ApiError("Product not available", 400);
  }

  // Store Validation
  const store = await orderDb.findStoreById(product.storeId);

  if (!store) {
    throw new ApiError("Store not found", 400);
  }

  if (!store.isPublic) {
    throw new ApiError("Store is private", 400);
  }

  if (store.isVacationMode) {
    throw new ApiError("Store is in vacation mode", 400);
  }
  //  TASK 9 (VERY IMPORTANT)
  if (store.isSuspended) {
    throw new ApiError("Store is suspended. Orders are disabled", 403);
  }
    

  // Variant Validation
  const variant = await orderDb.findVariantForOrder(
    variantId,
    productId
  );

  if (!variant) {
    throw new ApiError("Variant not found", 400);
  }


  // Price Freeze
  const priceAtPurchase = Number(variant.price);
  const totalAmount = priceAtPurchase * quantity;

  // Buyer Handling
  let buyer = await orderDb.findBuyerByEmailAndPhone(
    buyerEmail,
    buyerPhone
  );

  if (!buyer) {
    buyer = await orderDb.createBuyer({
      email: buyerEmail,
      phone: buyerPhone,
      name: buyerName,
    });
  }

// Create Order
  const order = await orderDb.insertOrder({
    storeId: product.storeId,
    productId,
    variantId,
    buyerId: buyer.id,
    buyerName,
    buyerEmail,
    buyerPhone,
    shippingAddress,
    quantity,
    priceAtPurchase: priceAtPurchase.toString(),
    totalAmount: totalAmount.toString(),
    paymentMethod,
    status: "PENDING",
  });

   await jobDb.createJob({
    type: "EMAIL",
    payload: {
      to: buyerEmail, // correct source
      template: "ORDER_CREATED",
      data: {
        orderId: order.id,
      },
    },
  });


  return {
    orderId: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
  };
};



type ListCreatorOrdersInput = {
  creatorId: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export const listCreatorOrders = async ({
  creatorId,
  status,
  startDate,
  endDate,
}: ListCreatorOrdersInput) => {

  // Find Creator Store
  const store = await dbGetStoreByUserId(creatorId);
  console.log("Store found for creator::::::::::::::::::::::::::::::::::::", store);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }

// Date Parsing
  const parsedStartDate = startDate ? new Date(startDate) : undefined;
  const parsedEndDate = endDate ? new Date(endDate) : undefined;


//  Fetch Orders
  const orders = await orderDb.findOrdersByStore({
    storeId: store.id,
    status,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  });

  return orders;
};

type GetCreatorOrderInput = {
  creatorId: string;
  orderId: string;
};

export const getCreatorOrder = async ({
  creatorId,
  orderId,
}: GetCreatorOrderInput) => {

  // Find Creator Store
  const store = await dbGetStoreByUserId(creatorId);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  // Fetch Order (Must Belong to Store)
  const order = await orderDb.findOrderByIdAndStore(
    orderId,
    store.id
  );
  if (!order) {
    throw new ApiError("Order not found", 404);
  }
  return order;
}

type UpdateOrderStatusInput = {
  creatorId: string;
  orderId: string;
  newStatus: string;
};

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

export const updateCreatorOrderStatus = async ({
  creatorId,
  orderId,
  newStatus,
}: UpdateOrderStatusInput) => {
// Find Store
  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

    //  Find Order (Must Belong to Store)

  const order = await orderDb.findOrderByIdAndStore(
    orderId,
    store.id
  );

  if (!order) {
    throw new ApiError("Order not found", 404);
  }
// valid Transition

  const currentStatus = order.status;

  const allowedNextStatuses = allowedTransitions[currentStatus];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new ApiError(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      400
    );
  }

  // Update Status

  const updatedOrder = await orderDb.updateOrderStatus(
    orderId,
    newStatus as any

  );

  
 
  if (newStatus === "DELIVERED") {
    await createPayoutForOrderService(orderId);
  }
    await jobDb.createJob({
    type: "EMAIL",
    payload: {
      to: order.buyerEmail, //  correct source
      template: "ORDER_STATUS_UPDATED",
      data: {
        orderId: order.id,
        status: updatedOrder.status,
      },
    },
  });

  return updatedOrder;
};






type MarkRefundInput = {
  userId: string;
  role: "CREATOR" | "ADMIN";
  orderId: string;
  refundAmount: number;
};

export const markOrderRefund = async ({
  userId,
  role,
  orderId,
  refundAmount,
}: MarkRefundInput) => {

  let order;

  if (role === "CREATOR") {

    const store = await dbGetStoreByUserId(userId);

    if (!store) {
      throw new ApiError("Store not found", 404);
    }

    order = await orderDb.findOrderByIdAndStore(
      orderId,
      store.id
    );

  } else {

    // ADMIN
    order = await orderDb.findOrderById(orderId);

  }

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  /*
  Prevent over refund
  */

  if (refundAmount > Number(order.totalAmount)) {
    throw new ApiError(
      "Refund amount cannot exceed total order amount",
      400
    );
  }

  /*
  Update refund in order
  */

  const updated = await orderDb.updateOrderRefund(
    orderId,
    refundAmount
  );

  /*
  Notify payout system
  */

  await adjustPayoutAfterRefund(orderId, refundAmount);

  return updated;
};





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