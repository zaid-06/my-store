import { env } from "../../config/env";
import * as payoutDb from "./payout.db";
import * as orderDb from "../orders/order.db";
import { ApiError } from "../../shared/api-error";
import { dbGetStoreByUserId } from "../stores/store.db";
import * as storeDb from "../stores/store.db";
import * as jobDb from "../jobs/job.db";
import * as adminAuditLogDb from "../admin/admin-audit.db";
import { assertStoreNotSuspended} from "../../guards/store.guard";

//It is  called  from order service ( order delevered)
export const createPayoutForOrderService = async (orderId: string) => {

  // Find Order
  const order = await orderDb.findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  const store = await storeDb.dbGetStoreById(order.storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  // if (store.isSuspended) {
  //   throw new ApiError("Store is suspended. Payouts are disabled", 403);
  // }
  assertStoreNotSuspended(store);
  // Prevent duplicate payout
  const existingPayout = await payoutDb.findPayoutByOrderId(orderId);

  if (existingPayout) {
    return existingPayout;
  }

  const commissionPercent = env.PLATFORM_COMMISSION_PERCENT;

  const grossAmount = Number(order.totalAmount);

  const commissionAmount = Number(
    (grossAmount * commissionPercent) / 100
  );

  const netAmount = grossAmount - commissionAmount;

  // Hold period
  const holdDays = env.PAYOUT_HOLD_DAYS;

  const eligibleAt = new Date();
  eligibleAt.setDate(eligibleAt.getDate() + 0 ); // 0 is a temp value for testing

  const payout = await payoutDb.createPayout({
    storeId: order.storeId,
    creatorId: order.storeId, // (assumption based on your schema)
    orderId: order.id,
    grossAmount,
    commissionAmount,
    netAmount,
    eligibleAt,
  });

  
   // SCHEDULE PAYOUT ELIGIBILITY JOB
  
  await jobDb.createJob({
    type: "PAYOUT_ELIGIBILITY",
    payload: {
      payoutId: payout.id,
    },
    runAt: payout.eligibleAt, // VERY IMPORTANT
  });

  return payout;
};


export const listCreatorPayoutsService = async ({
  creatorId,
  status,
  startDate,
  endDate,
}: {
  creatorId: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  

  // find creator store
  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  const payouts = await payoutDb.listPayoutsByStore({
    storeId: store.id,
    status,
    startDate,
    endDate,
  });

  return payouts;
};


export const getPayoutSummaryService = async (creatorId: string) => {

  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  const summary = await payoutDb.getPayoutSummaryByStore(store.id);

  return summary;
};



export const listAllPayoutsAdminService = async ({
  storeId,
  status,
  startDate,
  endDate,
}: {
  storeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  await updateEligiblePayouts();

  const payouts = await payoutDb.listAllPayouts({
    storeId,
    status,
    startDate,
    endDate,
  });

  return payouts;
};


export const updateEligiblePayouts = async () => {

  const lockedPayouts = await payoutDb.getLockedPayouts();

  const now = new Date();

  for (const payout of lockedPayouts) {

    //  TASK 9: skip frozen payouts
    if (payout.isFrozen) {
      continue;
    }


    if (new Date(payout.eligibleAt) <= now) {

      const order = await orderDb.findOrderById(payout.orderId);

      if (
        order &&
        order.status === "DELIVERED" &&
         Number(order.refundAmount || 0) < Number(order.totalAmount) // added this

      ) {
        await payoutDb.markPayoutEligible(payout.id);
      }

    }

  }

};





export const releasePayoutService = async (payoutId: string, adminId: string ) => {

  // const payout = await payoutDb.findPayoutById(payoutId);

  // if (!payout) {
  //   throw new ApiError("Payout not found", 404);
  // }

  
  const payout = await payoutDb.findPayoutWithCreator(payoutId);

  if (!payout) {
    throw new ApiError("Payout not found", 404);
  }

  const store = payout.store;
  const creatorEmail = payout.store.user.email;

  // BLOCK IF STORE SUSPENDED
  assertStoreNotSuspended(store);
  //  TASK 9: BLOCK IF FROZEN
  if (payout.isFrozen) {
    throw new ApiError("Payout is frozen and cannot be released", 403);
  }
  // Idempotency protection
  if (payout.status === "RELEASED") {
    return payout;
  }

  // Only ELIGIBLE payouts can be released
  if (payout.status !== "ELIGIBLE") {
    throw new ApiError("Payout not eligible for release", 400);
  }

  const updatedPayout = await payoutDb.releasePayout(payoutId);


   //CREATE EMAIL JOB (Notify Creator)
  
  await jobDb.createJob({
    type: "EMAIL",
    payload: {
      to: creatorEmail, //  ensure this exists
      template: "PAYOUT_RELEASED",
      data: {
        amount: payout.netAmount,
      },
    }, 
  });

  return updatedPayout;
};


export const adjustPayoutAfterRefund = async (
  orderId: string,
  refundAmount: number
) => {

  const payout = await payoutDb.findPayoutByOrderId(orderId);

  if (!payout) {
    return;
  }
  //  TASK 9: skip frozen payouts
  if (payout.isFrozen) return;

  // If payout already released → do nothing
  if (payout.status === "RELEASED") {
    return;
  }

  const grossAmount = Number(payout.grossAmount);

  // FULL REFUND
  if (refundAmount >= grossAmount) {

    await payoutDb.cancelPayout(payout.id);

    return;
  }

  // PARTIAL REFUND

   const commissionPercent = env.PLATFORM_COMMISSION_PERCENT;

  // ADD THIS HELPER
  const round = (val: number) => Number(val.toFixed(2));

  // APPLY ROUNDING HERE
  const newGross = round(grossAmount - refundAmount);

  const newCommission = round(
    (newGross * commissionPercent) / 100
  );

  const newNet = round(newGross - newCommission);

  // NEGATIVE CHECK HERE
  if (newNet < 0) {
    throw new Error("Invalid payout calculation: negative net amount");
  }

  await payoutDb.updatePayoutAmounts({
    payoutId: payout.id,
    grossAmount: newGross,
    commissionAmount: newCommission ,
    netAmount: newNet,
  });
};



export const cancelPayoutService = async (payoutId: string) => {

  const payout = await payoutDb.findPayoutById(payoutId);

  if (!payout) {
    throw new ApiError("Payout not found", 404);
  }

   // BLOCK IF FROZEN
  if (payout.isFrozen) {
    throw new ApiError("Payout is frozen and cannot be cancelled", 403);
  }

  //  Cannot cancel released payout
  if (payout.status === "RELEASED") {
    throw new ApiError("Released payout cannot be cancelled", 400);
  }

  // idempotent behaviour
  if (payout.status === "CANCELLED") {
    return payout;
  }

  await payoutDb.cancelPayout(payoutId);

  return {
    ...payout,
    status: "CANCELLED",
    netAmount: "0"
  };
};

export const freezePayoutService = async ({
  payoutId,
  adminId,
}: {
  payoutId: string;
  adminId: string;
}) => {
  const payout = await payoutDb.findPayoutById(payoutId);

  if (!payout) {
    throw new ApiError("Payout not found", 404);
  }

  if (payout.isFrozen) {
    throw new ApiError("Payout already frozen", 400);
  }

  await payoutDb.setPayoutFrozen(payoutId, true);

  //  TASK 9: AUDIT LOG
  await adminAuditLogDb.createLog({
    adminId,
    action: "PAYOUT_FREEZE",
    entityType: "PAYOUT",
    entityId: payoutId,
    metadata: {},
  });

  return { message: "Payout frozen successfully" };
};

export const unfreezePayoutService = async ({
  payoutId,
  adminId,
}: {
  payoutId: string;
  adminId: string;
}) => {
  const payout = await payoutDb.findPayoutById(payoutId);

  if (!payout) {
    throw new ApiError("Payout not found", 404);
  }

  if (!payout.isFrozen) {
    throw new ApiError("Payout is not frozen", 400);
  }

  await payoutDb.setPayoutFrozen(payoutId, false);

  //  TASK 9: AUDIT LOG
  await adminAuditLogDb.createLog({
    adminId,
    action: "PAYOUT_UNFREEZE",
    entityType: "PAYOUT",
    entityId: payoutId,
    metadata: {},
  });

  return { message: "Payout unfrozen successfully" };
};