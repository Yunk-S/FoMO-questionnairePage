import { createHmac, timingSafeEqual } from "crypto";

const SESSION_DURATION_MS = 1000 * 60 * 30;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "local-development-secret";
}

function sign(expiresAt: number) {
  return createHmac("sha256", getSecret()).update(String(expiresAt)).digest("base64url");
}

export function createAdminToken() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidAdminToken(token?: string) {
  if (!token) {
    return false;
  }

  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || !signature || expiresAt < Date.now()) {
    return false;
  }

  const expected = sign(expiresAt);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function isAdminRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

  return isValidAdminToken(token);
}

export function verifyAdminPassword(password: unknown) {
  if (typeof password !== "string") {
    return false;
  }

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    return false;
  }

  return password === configuredPassword;
}
