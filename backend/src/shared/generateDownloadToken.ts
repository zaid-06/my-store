import crypto from "crypto";

export const generateDownloadToken = () => {
  return crypto.randomBytes(48).toString("hex"); // 96 chars
};