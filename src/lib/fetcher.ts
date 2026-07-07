export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error || `Lỗi ${res.status}`, res.status, body?.details);
  }

  return res.json() as Promise<T>;
}

export const apiGet = <T>(url: string) => api<T>(url);
export const apiPost = <T>(url: string, data: unknown) =>
  api<T>(url, { method: "POST", body: JSON.stringify(data) });
export const apiPut = <T>(url: string, data: unknown) =>
  api<T>(url, { method: "PUT", body: JSON.stringify(data) });
export const apiPatch = <T>(url: string, data: unknown) =>
  api<T>(url, { method: "PATCH", body: JSON.stringify(data) });
export const apiDelete = <T>(url: string) => api<T>(url, { method: "DELETE" });
