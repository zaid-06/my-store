import { db } from "../../config/db";
import { conversations, messages } from "./message.schema";
import { orders } from "../orders/order.schema";
import { eq, and, gte, lte, isNull} from "drizzle-orm";
import { randomUUID } from "crypto";


export const findConversationByOrderId = async (orderId: string) => {
  return db.query.conversations.findFirst({
    where: eq(conversations.orderId, orderId),
  });
};

export const createConversation = async ({
  orderId,
  storeId,
  customerId,
  
}: {
  orderId: string;
  storeId: string;
  customerId: string;
  
}) => {
  const [conversation] = await db
    .insert(conversations)
    .values({
      orderId,
      storeId,
      customerId,
    
    })
    .returning();

  return conversation;
};

export const createMessage = async ({
  conversationId,
  senderRole,
  senderId,
  content,
}: {
  conversationId: string;
  senderRole: "BUYER" | "CREATOR" | "ADMIN";
  senderId: string;
  content: string;
}) => {
  const id = randomUUID();

  await db.insert(messages).values({
    id,
    conversationId,
    senderRole,
    senderId,
    content,
  });

  return { id, conversationId, senderRole, senderId, content };
};



export const adminGetMessagesByConversationId = async (conversationId: string) => {
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });
};

export const getMessagesByConversationId = async (conversationId: string) => {
  return db.query.messages.findMany({
    where: and(
      eq(messages.conversationId, conversationId),
      isNull(messages.deletedAt)
    ),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });
};



export const findConversationById = async (conversationId: string) => {
  return db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });
};

export const setConversationDispute = async (
  conversationId: string,
  value: boolean
) => {
  const [updated] = await db
    .update(conversations)
    .set({
      isDisputed: value,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId))
    .returning();

  return updated;
};



export const getConversationsByStore = async (
  storeId: string,
  isDisputed?: boolean
) => {
  if (isDisputed !== undefined) {
    return db.query.conversations.findMany({
      where: and(
        eq(conversations.storeId, storeId),
        eq(conversations.isDisputed, isDisputed)
      ),
      orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
    });
  }

  return db.query.conversations.findMany({
    where: eq(conversations.storeId, storeId),
    orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
  });
};




export const getAdminConversations = async ({
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
  const conditions = [];

  if (isDisputed !== undefined) {
    conditions.push(eq(conversations.isDisputed, isDisputed));
  }

  if (storeId) {
    conditions.push(eq(conversations.storeId, storeId));
  }

  if (startDate) {
    conditions.push(gte(conversations.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(conversations.createdAt, endDate));
  }

  return db.query.conversations.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
  });
};

export const findMessageById = async (messageId: string) => {
  return db.query.messages.findFirst({
    where: eq(messages.id, messageId),
  });
};

export const softDeleteMessageById = async (messageId: string) => {
  const [message] = await db
    .update(messages)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(messages.id, messageId))
    .returning();

  return message;
};