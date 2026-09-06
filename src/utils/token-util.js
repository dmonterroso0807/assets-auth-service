import crypto from "crypto";

export const generateRawToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

export const safeCompareHex = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const minutesFromNow = (minutes) =>
  new Date(Date.now() + minutes * 60 * 1000);

export const buildTokenUrl = (baseUrl, uid, rawToken) =>
  `${baseUrl}?uid=${uid}&token=${rawToken}`;
