import { db } from "../../config/db";


import { adminAuditLogs } from "./admin-audit.schema";

export const createLog = async (data: {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
}) => {
  await db.insert(adminAuditLogs).values({
    ...data,
    createdAt: new Date(),
  });
};