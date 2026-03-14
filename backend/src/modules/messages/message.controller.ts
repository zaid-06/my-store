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
  try {
    const { orderId } = req.params;

    // validate body
    const parsed = guestMessageSchema.parse(req.body);
    const { email, phone, content } = parsed;

    const result = await sendMessageForOrderService({
      orderId : Array.isArray(orderId) ? orderId[0] : orderId,
      email,
      phone,
      content,
    });

    return res.status(200).json({
      message: "Message sent successfully",
      data: result,
    });

  } catch (err: any) {

    //  Handle Zod validation errors
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message ,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to send message",
    });
  }
};


export const getMessagesForOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    //  validate query
    const parsed = getMessagesQuerySchema.parse(req.query);
    const { email, phone } = parsed;

    const messages = await getMessagesForOrderService({
      orderId : Array.isArray(orderId) ? orderId[0] : orderId,
      email,
      phone,
    });

    return res.json({
      data: messages,
    });

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to fetch messages",
    });
  }
};



export const escalateDispute = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    //  validate body
    const parsed = escalateDisputeSchema.parse(req.body);
    const { email, phone } = parsed;

    const result = await escalateDisputeService({
      conversationId : Array.isArray(conversationId) ? conversationId[0] : conversationId,
      email,
      phone,
    });

    return res.json({
      message: "Dispute escalated successfully",
      data: result,
    });

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to escalate dispute",
    });
  }
};


export const resolveDispute = async (req: Request, res: Response) => {
  console.log("Admin resolving dispute for conversation...");

  try {
    //  validate params
    const parsed = conversationParamSchema.parse(req.params);
    const { conversationId } = parsed;

    const result = await resolveDisputeService(conversationId);

    return res.json(result);

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to resolve dispute",
    });
  }
};





export const listCreatorConversations = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  validate query
    const parsed = creatorConversationQuerySchema.parse(req.query);
    const { isDisputed } = parsed;

    const conversations = await listCreatorConversationsService({
      creatorId: session.user.id,
      isDisputed,
    });

    return res.json({
      data: conversations,
    });

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to fetch conversations",
    });
  }
};



export const getConversation = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  validate params
    const parsed = conversationParamSchema.parse(req.params);
    const { conversationId } = parsed;

    const conversation = await getConversationService({
      creatorId: session.user.id,
      conversationId,
    });

    return res.json({
      data: conversation,
    });

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to fetch conversation",
    });
  }
};

export const sendCreatorMessage = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params;

    //  Zod validation
    const parsed = messageContentSchema.parse(req.body);
    const { content } = parsed;

    const message = await sendCreatorMessageService({
      creatorId: session.user.id,
      conversationId : Array.isArray(conversationId) ? conversationId[0] : conversationId,
      content,
    });

    return res.json({
      message: "Message sent",
      data: message,
    });

  } catch (err: any) {

    //  Zod validation error
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to send message",
    });
  }
};



export const listAdminConversations = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 
    //  validate query
    const parsed = adminConversationQuerySchema.parse(req.query);

    const result = await listAdminConversationsService({
      isDisputed: parsed.isDisputed,
      storeId: parsed.storeId,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    });

    return res.json({
      data: result,
    });

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to fetch conversations",
    });
  }
};

export const getAdminConversation = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { conversationId } = req.params;

    const result = await getAdminConversationService(conversationId as string);

    return res.json({
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err.message ?? "Failed to fetch conversation",
    });
  }
};


export const softDeleteMessage = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //  validate params
    const parsed = messageParamSchema.parse(req.params);
    const { messageId } = parsed;

    const result = await softDeleteMessageService(messageId);

    return res.json({
      message: "Message deleted successfully",
      data: result,
    });

  } catch (err: any) {

    if (err instanceof ZodError) {
      return res.status(400).json({
        error: err.issues[0].message,
      });
    }

    return res.status(400).json({
      error: err.message ?? "Failed to delete message",
    });
  }
};