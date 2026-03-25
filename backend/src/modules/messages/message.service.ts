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
  // 1 find order
  const order = await findOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // cancelled order check
  if (order.status === "CANCELLED") {
    throw new Error("Cannot message cancelled order");
  }

  // verify buyer
  if (order.buyerEmail !== email || order.buyerPhone !== phone) {
    throw new Error("Buyer verification failed");
  }

  // find conversation
  let conversation = await findConversationByOrderId(orderId);

  //  create conversation if missing (lazy creation)
  if (!conversation) {
    conversation = await createConversation({
      orderId,
      storeId: order.storeId,
      creatorId: order.storeId ,
      buyerEmail: order.buyerEmail,
    });
  }

  //  create message
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
  // 1 find order
  const order = await findOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  // 2 verify buyer
  if (order.buyerEmail !== email || order.buyerPhone !== phone) {
    throw new Error("Buyer verification failed");
  }

  // 3 find conversation
  const conversation = await findConversationByOrderId(orderId);

  if (!conversation) {
    return [];
  }

  // 4 get messages
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
  //  find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  //  get order
  const order = await findOrderById(conversation.orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  //  verify buyer
  if (order.buyerEmail !== email || order.buyerPhone !== phone) {
    throw new Error("Buyer verification failed");
  }

  //  already disputed check
  if (conversation.isDisputed) {
    throw new Error("Conversation already disputed");
  }

  // set dispute
  const updated = await setConversationDispute(conversationId, true);

  await jobDb.createJob({
    type: "EMAIL",
    payload: {
      to: "admin@platform.com", // or env.ADMIN_EMAIL
      template: "DISPUTE_ESCALATED",
      data: {
        orderId: order.id, // 
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
    throw new Error("Conversation not found");
  }

  if (!conversation.isDisputed) {
    throw new Error("Conversation is not disputed");
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
  // find creator store
  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new Error("Store not found for creator");
  }

  //  fetch conversations
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
  //  find creator store
  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new Error("Store not found for creator");
  }

  //  find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  //  store isolation check
  if (conversation.storeId !== store.id) {
    throw new Error("Access denied to this conversation");
  }

  //  fetch messages
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
  //  find creator store
  const store = await dbGetStoreByUserId(creatorId);

  if (!store) {
    throw new Error("Store not found for creator");
  }

  //  find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  //  store isolation check
  if (conversation.storeId !== store.id) {
    throw new Error("Access denied to this conversation");
  }

  //  create message
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
  //  find conversation
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  //  get messages
  const messages = await adminGetMessagesByConversationId(conversationId);

  return {
    conversation,
    messages,
  };
};



export const softDeleteMessageService = async (messageId: string) => {
  const message = await findMessageById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.deletedAt) {
    throw new Error("Message already deleted");
  }

  const updated = await softDeleteMessageById(messageId);

  return updated;
};