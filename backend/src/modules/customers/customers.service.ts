import * as customerDb from "./customers.db";

export const getOrCreateCustomer = async ({
  userId,
  email,
  phone,
  name,
}: {
  userId?: string | null;
  email: string;
  phone: string;
  name: string;
}) => {
  //  STEP 1: try find existing
  const existing = await customerDb.findCustomerByEmailAndPhone(
    email,
    phone
  );

  if (existing) {
    return existing;
  }

  //  STEP 2: create new
  const [customer] = await customerDb.insertCustomer({
    userId: userId ?? null,
    email,
    phone,
    name,
  });

  return customer;
};