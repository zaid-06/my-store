import * as merchantDb from "./merchant.db";

export const getOrCreateMerchant = async (userId: string) => {
  let merchant = await merchantDb.findMerchantByUserId(userId);

  if (!merchant) {
    merchant = await merchantDb.createMerchant(userId);
  }

  return merchant;
};