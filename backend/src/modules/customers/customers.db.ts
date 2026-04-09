import { db } from "../../config/db";
import { customers } from "./customers.schema";
import { eq, and } from "drizzle-orm";

export const findCustomerByEmailAndPhone = async (
  email: string,
  phone: string
) => {
  return db.query.customers.findFirst({
    where: and(
      eq(customers.email, email),
      eq(customers.phone, phone)
    ),
  });
};

export const insertCustomer = async (data: {
  userId?: string | null;
  email: string;
  phone: string;
  name: string;
}) => {
  return db.insert(customers).values(data).returning();
};