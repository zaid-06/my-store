import { Request, Response } from "express";
import { ZodError } from "zod";
import { 
  sendMessageForOrderService,
  getMessagesForOrderService,
  escalateDisputeService,
  resolveDisputeService,
  listCreatorConversationsService,
  getConversationService,
  sendCreatorMessageService,
  listAdminConversationsService,
  getAdminConversationService,
  softDeleteMessageService,

 } from "./message.service";

import { fromNodeHeaders } from "better-auth/node";
// import * as storeService from "./store.service";
import { auth } from "../auth/auth.config";
import { successResponse } from "../../shared/response";
import { guestMessageSchema,
  messageContentSchema,
  getMessagesQuerySchema,
  escalateDisputeSchema,
  creatorConversationQuerySchema,
  conversationParamSchema,
  adminConversationQuerySchema,
  messageParamSchema


} from "./message.schema";


export const sendMessageForOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const parsed = guestMessageSchema.parse(req.body);

  const result = await sendMessageForOrderService({
    orderId: Array.isArray(orderId) ? orderId[0] : orderId,
    email: parsed.email,
    phone: parsed.phone,
    content: parsed.content,
  });

  return res.status(200).json(
    successResponse(result)
  );
};



export const getMessagesForOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const parsed = getMessagesQuerySchema.parse(req.query);

  const messages = await getMessagesForOrderService({
    orderId: Array.isArray(orderId) ? orderId[0] : orderId,
    email: parsed.email,
    phone: parsed.phone,
  });

  return res.status(200).json(
    successResponse(messages)
  );
};



export const escalateDispute = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  const parsed = escalateDisputeSchema.parse(req.body);

  const result = await escalateDisputeService({
    conversationId: Array.isArray(conversationId)
      ? conversationId[0]
      : conversationId,
    email: parsed.email,
    phone: parsed.phone,
  });

  return res.status(200).json(
    successResponse(result)
  );
};


export const resolveDispute = async (req: Request, res: Response) => {
  const parsed = conversationParamSchema.parse(req.params);

  const result = await resolveDisputeService(parsed.conversationId);

  return res.status(200).json(
    successResponse(result)
  );
};





export const listCreatorConversations = async (
  req: Request,
  res: Response
) => {
  const user = req.user!; // from requireAuth

  const parsed = creatorConversationQuerySchema.parse(req.query);

  const conversations = await listCreatorConversationsService({
    creatorId: user.id,
    isDisputed: parsed.isDisputed,
  });

  return res.status(200).json(
    successResponse(conversations)
  );
};



export const getConversation = async (req: Request, res: Response) => {
  const user = req.user!; //  from requireAuth

  const parsed = conversationParamSchema.parse(req.params);

  const conversation = await getConversationService({
    creatorId: user.id,
    conversationId: parsed.conversationId,
  });

  return res.status(200).json(
    successResponse(conversation)
  );
};
export const sendCreatorMessage = async (req: Request, res: Response) => {
  const user = req.user!; //  from requireAuth

  const { conversationId } = req.params;

  const parsed = messageContentSchema.parse(req.body);

  const message = await sendCreatorMessageService({
    creatorId: user.id,
    conversationId: Array.isArray(conversationId)
      ? conversationId[0]
      : conversationId,
    content: parsed.content,
  });

  return res.status(200).json(
    successResponse(message)
  );
};


export const listAdminConversations = async (
  req: Request,
  res: Response
) => {
  const parsed = adminConversationQuerySchema.parse(req.query);

  const result = await listAdminConversationsService({
    isDisputed: parsed.isDisputed,
    storeId: parsed.storeId,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
  });

  return res.status(200).json(
    successResponse(result)
  );
};

export const getAdminConversation = async (
  req: Request,
  res: Response
) => {
  const { conversationId } = req.params;

  const result = await getAdminConversationService(
    Array.isArray(conversationId) ? conversationId[0] : conversationId
  );

  return res.status(200).json(
    successResponse(result)
  );
};
export const softDeleteMessage = async (
  req: Request,
  res: Response
) => {
  const user = req.user!; // from requireAuth

  const parsed = messageParamSchema.parse(req.params);

  const result = await softDeleteMessageService({
    messageId: parsed.messageId,
    adminId: user.id,
    isAdmin: true,
  });

  return res.status(200).json(
    successResponse(result)
  );
};