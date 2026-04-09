import {

  findConversationByOrderId,
  getMessagesByConversationId,
  createConversation,
  createMessage,
  findConversationById,
  setConversationDispute,
  getAdminConversations,
  getConversationsByStore,
  softDeleteMessageById,
  findMessageById,
  adminGetMessagesByConversationId,
} from "./message.db";
import { findOrderById } from "../orders/order.db";
import { dbGetStoreById } from "../stores/store.db";
import { getMyStoreService } from "../stores/store.service";
import { ApiError } from "../../shared/api-error";
import * as jobDb from "../jobs/job.db";
import * as adminAuditLogDb from "../admin/admin-audit.db"
import { assertStoreNotSuspended} from "../../guards/store.guard";
import { env } from "../../config/env";

export const sendMessageForOrderService = async ({
  orderId,
  email,
  phone,
  content,
}: {
  orderId: string;
  email: string;
  phone: string;
  content: string;
}) => {
  const order = await findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  const store = await dbGetStoreById(order.storeId);

  if (!store) {
    throw new ApiError("Store not found", 404);
  }

  if (order.status === "CANCELLED") {
    throw new ApiError("Cannot message cancelled order", 400);
  }

  if (order.customerEmail !== email || order.customerPhone !== phone) {
    throw new ApiError("Buyer verification failed", 403);
  }
  let conversation = await findConversationByOrderId(orderId);
  if (!conversation) {
    conversation = await createConversation({
      orderId,
      storeId: order.storeId,
      customerId: order.customerId,

    });
  }

  const message = await createMessage({
    conversationId: conversation.id,
    senderRole: "BUYER",
    senderId: email,
    content,
  });
  return message; // 
};


export const getMessagesForOrderService = async ({
  orderId,
  email,
  phone,
}: {
  orderId: string;
  email: string;
  phone: string;
}) => {
  const order = await findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  if (order.customerEmail !== email || order.customerPhone !== phone) {
    throw new ApiError("Customer verification failed", 403);
  }

  const conversation = await findConversationByOrderId(orderId);

  if (!conversation) {
    return []; //  correct behavior
  }

  return await getMessagesByConversationId(conversation.id);
};
// buyer
export const escalateDisputeService = async ({
  conversationId,
  email,
  phone,
}: {
  conversationId: string;
  email: string;
  phone: string;
}) => {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError("Conversation not found", 404);
  }

  const order = await findOrderById(conversation.orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  if (order.customerEmail !== email || order.customerPhone !== phone) {
    throw new ApiError("Customer verification failed", 403);
  }

  if (conversation.isDisputed) {
    throw new ApiError("Conversation already disputed", 400);
  }
  const updated = await setConversationDispute(conversationId, true);
  //  use env instead of hardcoded email
  await jobDb.createJob({
    type: "EMAIL",
    payload: {
      to: env.ADMIN_EMAIL,
      template: "DISPUTE_ESCALATED",
      data: {
        orderId: order.id,
      },
    },
  });

  return updated; //  ONLY DATA
};


// admin
export const resolveDisputeService = async (conversationId: string) => {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError("Conversation not found", 404);
  }

  if (!conversation.isDisputed) {
    throw new ApiError("Conversation is not disputed", 400);
  }

  const updated = await setConversationDispute(conversationId, false);

  return updated; // ONLY DATA
};




export const listCreatorConversationsService = async ({
  creatorId,
  isDisputed,
}: {
  creatorId: string;
  isDisputed?: boolean;
}) => {
  // 1. find creator store
  const store = await getMyStoreService(creatorId);

  if (!store) {
    throw new ApiError("Store not found for creator", 404);
  }

  // 2. fetch conversations
  const conversations = await getConversationsByStore(
    store.id,
    isDisputed
  );

  return conversations;
};


export const getConversationService = async ({
  creatorId,
  conversationId,
}: {
  creatorId: string;
  conversationId: string;
}) => {
  // 1. find creator store
  const store = await getMyStoreService(creatorId);

  if (!store) {
    throw new ApiError("Store not found for creator", 404);
  }

  // 2. find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError("Conversation not found", 404);
  }

  // 3. store isolation check
  if (conversation.storeId !== store.id) {
    throw new ApiError("Access denied to this conversation", 403);
  }

  // 4. fetch messages
  const messages = await getMessagesByConversationId(conversationId);

  return {
    conversation,
    messages,
  };
};


export const sendCreatorMessageService = async ({
  creatorId,
  conversationId,
  content,
}: {
  creatorId: string;
  conversationId: string;
  content: string;
}) => {
  // 1. find creator store
  const store = await getMyStoreService(creatorId);

  if (!store) {
    throw new ApiError("Store not found for creator", 404);
  }

  // TASK 9: BLOCK IF SUSPENDED
  assertStoreNotSuspended(store);

  // 2. find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError("Conversation not found", 404);
  }

  // 3. store isolation check
  if (conversation.storeId !== store.id) {
    throw new ApiError("Access denied to this conversation", 403);
  }
   //  NEW: FETCH ORDER
  const order = await findOrderById(conversation.orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  //  TASK 9: BLOCK IF ORDER CANCELLED
  if (order.status === "CANCELLED") {
    throw new ApiError("Cannot message cancelled order", 400);
  }

  // 4. create message
  const message = await createMessage({
    conversationId,
    senderRole: "CREATOR",
    senderId: creatorId,
    content,
  });

  return message;
};


export const listAdminConversationsService = async ({
  isDisputed,
  storeId,
  startDate,
  endDate,
}: {
  isDisputed?: boolean;
  storeId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const conversations = await getAdminConversations({
    isDisputed,
    storeId,
    startDate,
    endDate,
  });

  return conversations;
};



export const getAdminConversationService = async (
  conversationId: string
) => {
  // 1. find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError("Conversation not found", 404);
  }

  // 2. get messages (admin can see all, no restriction)
  const messages = await adminGetMessagesByConversationId(conversationId);

  return {
    conversation,
    messages,
  };
};


export const softDeleteMessageService = async ({
  messageId,
  adminId,
  isAdmin = false,
}: {
  messageId: string;
  adminId?: string;
  isAdmin?: boolean;
}) => {

  const message = await findMessageById(messageId);

  if (!message) {
    throw new ApiError("Message not found", 404);
  }

  if (message.deletedAt) {
    throw new ApiError("Message already deleted", 400);
  }

  const updated = await softDeleteMessageById(messageId);

  //  TASK 9: LOG ONLY IF ADMIN
  if (isAdmin && adminId) {
    await adminAuditLogDb.createLog({
      adminId,
      action: "MESSAGE_DELETE",
      entityType: "MESSAGE",
      entityId: messageId,
      metadata: {},
    });
  }

  return updated;
};