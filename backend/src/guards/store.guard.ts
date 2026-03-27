import { ApiError } from "../shared/api-error";

export const assertStoreNotSuspended = (store: any) => {
  if (store.isSuspended) {
    throw new ApiError("Store is suspended", 403);
  }
};