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
import { dbGetStoreByUserId } from "../stores/store.db";
import { ApiError } from "../../shared/api-error";
import * as jobDb from "../jobs/job.db";

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
  // 1. find order
  const order = await findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // cancelled order check
  if (order.status === "CANCELLED") {
    throw new ApiError("Cannot message cancelled order", 400);
  }

  // verify buyer
  if (order.buyerEmail !== email || order.buyerPhone !== phone) {
    throw new ApiError("Buyer verification failed", 403);
  }

  // find conversation
  let conversation = await findConversationByOrderId(orderId);

  // create conversation if missing (lazy creation)
  if (!conversation) {
    conversation = await createConversation({
      orderId,
      storeId: order.storeId,
      creatorId: order.storeId,
      buyerEmail: order.buyerEmail,
    });
  }

  // create message
  const message = await createMessage({
    conversationId: conversation.id,
    senderRole: "BUYER",
    senderId: email,
    content,
  });

  return {
    message: "Message sent",
    data: message,
  };
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
  // 1. find order
  const order = await findOrderById(orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // 2. verify buyer
  if (order.buyerEmail !== email || order.buyerPhone !== phone) {
    throw new ApiError("Buyer verification failed", 403);
  }

  // 3. find conversation
  const conversation = await findConversationByOrderId(orderId);

  if (!conversation) {
    return []; //  correct: no error, just no messages
  }

  // 4. get messages
  const messages = await getMessagesByConversationId(conversation.id);

  return messages;
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
  // 1. find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError("Conversation not found", 404);
  }

  // 2. get order
  const order = await findOrderById(conversation.orderId);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // 3. verify buyer
  if (order.buyerEmail !== email || order.buyerPhone !== phone) {
    throw new ApiError("Buyer verification failed", 403);
  }

  // 4. already disputed check
  if (conversation.isDisputed) {
    throw new ApiError("Conversation already disputed", 400);
  }

  // 5. set dispute
  const updated = await setConversationDispute(conversationId, true);

  // 6. notify admin
  await jobDb.createJob({
    type: "EMAIL",
    payload: {
      to: "admin@platform.com", // ideally env.ADMIN_EMAIL
      template: "DISPUTE_ESCALATED",
      data: {
        orderId: order.id,
      },
    },
  });

  return {
    message: "Dispute escalated",
    data: updated,
  };
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

  return {
    message: "Dispute resolved",
    data: updated,
  };
};


export const listCreatorConversationsService = async ({
  creatorId,
  isDisputed,
}: {
  creatorId: string;
  isDisputed?: boolean;
}) => {
  // 1. find creator store
  const store = await dbGetStoreByUserId(creatorId);

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
  const store = await dbGetStoreByUserId(creatorId);

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
  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new ApiError("Store not found for creator", 404);
  }

  // TASK 9: BLOCK IF SUSPENDED
  if (store.isSuspended) {
    throw new ApiError("Store is suspended. Messaging disabled", 403);
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



export const softDeleteMessageService = async (messageId: string) => {
  const message = await findMessageById(messageId);

  if (!message) {
    throw new ApiError("Message not found", 404);
  }

  if (message.deletedAt) {
    throw new ApiError("Message already deleted", 400);
  }

  const updated = await softDeleteMessageById(messageId);

  return updated;
};