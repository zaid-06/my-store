import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as storeService from "./store.service";
import { auth } from "../auth/auth.config";

/**
 * Controller to create a new store for the authenticated user
 */
export const createStoreController = async (req: Request, res: Response) => {
  console.log("in createStoreController...")
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  console.log("User ID:", session?.user.id)
  console.log("Req User:", req.user)

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if the user already has a store
  const existingStore = await storeService.getStoreByUserId(session.user.id);
  if (existingStore) {
    return res.status(400).json({ error: "Store already exists" });
  }

  // Check if the username is already taken
  const usernameTaken = await storeService.getStoreByUsername(req.body.username);
  if (usernameTaken) {
    return res.status(400).json({ error: "Username already taken" });
  }

  // Create the new store
  const store = await storeService.createStore({
    ...req.body,
    userId: session.user.id,
  });

  return res.json(store);
};

/**
 * Controller to get the authenticated user's store
 */
export const getMyStoreController = async (req: Request, res: Response) => {
  console.log("in getMyStoreController...............")
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const store = await storeService.getStoreByUserId(session.user.id);
  return res.json(store);
};

/**
 * Controller to get a public store by username
 */
export const getPublicStoreController = async (
  req: Request<{ username: string }>,
  res: Response
) => {
  const store = await storeService.getStoreByUsername(req.params.username);

  if (!store || !store.isPublic || store.deletedAt) {
    return res.status(404).json({ error: "Store not found" });
  }

  // Return only public store fields
  return res.json({
    username: store.username,
    name: store.name,
    description: store.description,
    avatarUrl: store.avatarUrl,
    bannerUrl: store.bannerUrl,
    announcementText: store.announcementText,
    announcementEnabled: store.announcementEnabled,
    isVacationMode: store.isVacationMode,
  });
};

export const updateStoreController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const existingStore = await storeService.getStoreByUserId(session.user.id);
  if (!existingStore) {
    return res.status(404).json({ error: "Store not found" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};

  // Username is immutable
  if (body.username !== undefined) {
    return res.status(400).json({ error: "Username cannot be changed" });
  }

  const updatable = {
    name: body.name,
    description: body.description,
    avatarUrl: body.avatarUrl,
    bannerUrl: body.bannerUrl,
    isPublic: body.isPublic,
    isVacationMode: body.isVacationMode,
    announcementText: body.announcementText,
    announcementEnabled: body.announcementEnabled,
    updatedAt: new Date(),
  };
  const data = Object.fromEntries(
    Object.entries(updatable).filter(([, v]) => v !== undefined)
  );

  const hasUpdates = Object.keys(data).some((k) => k !== "updatedAt");
  if (!hasUpdates) {
    return res.status(400).json({
      error:
        "No updatable fields provided. Send a JSON body with at least one of: name, description, avatarUrl, bannerUrl, isPublic, isVacationMode, announcementText, announcementEnabled. Ensure Content-Type: application/json is set.",
    });
  }

  await storeService.updateStore(session.user.id, data);
  const store = await storeService.getStoreByUserId(session.user.id);
  return res.json(store ?? existingStore);
};

/**
 * Controller to soft-delete the authenticated user's store
 * Sets deletedAt; username stays reserved; store is hidden from public.
 */
export const deleteMyStoreController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const existingStore = await storeService.getStoreByUserId(session.user.id);

  if (!existingStore) {
    return res.status(404).json({ error: "Store not found" });
  }
  console.log("existingStore:....................", existingStore)
  if (existingStore.deletedAt) {
    return res.status(200).json({ message: "Store already deleted" });
  }

  await storeService.softDeleteStore(session.user.id);
  return res.status(200).json({ message: "Store deleted" });
};


