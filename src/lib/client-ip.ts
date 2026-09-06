import { isIP } from "node:net";

const ALLOWED_HEADERS = new Set(["x-forwarded-for", "x-real-ip", "cf-connecting-ip"]);

/**
 * Reads only the proxy header configured by the operator. For X-Forwarded-For
 * the right-most address is used because Nginx appends/sets the peer address.
 */
export function getClientIp(headers: Headers): string {
  const configured = (process.env.CLIENT_IP_HEADER || "x-forwarded-for").trim().toLowerCase();
  const headerName = ALLOWED_HEADERS.has(configured) ? configured : "x-forwarded-for";
  const raw = headers.get(headerName);
  if (!raw) return "unknown";

  const candidate = (headerName === "x-forwarded-for" ? raw.split(",").at(-1) : raw)
    ?.trim()
    .replace(/^\[|\]$/g, "");

  return candidate && isIP(candidate) ? candidate : "unknown";
}
