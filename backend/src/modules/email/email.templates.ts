



export const ORDER_CREATED = (data: any) => ({
  subject: "Your order has been created",
  body: `Order ${data.orderId} has been successfully created.`,
});

export const ORDER_STATUS_UPDATED = (data: any) => ({
  subject: "Order status updated",
  body: `Your order ${data.orderId} status is now ${data.status}.`,
});

export const DISPUTE_ESCALATED = (data: any) => ({
  subject: "Dispute escalated",
  body: `Dispute for order ${data.orderId} has been escalated.`,
});

export const PAYOUT_RELEASED = (data: any) => ({
  subject: "Payout released",
  body: `Your payout of ₹${data.amount} has been released.`,
});