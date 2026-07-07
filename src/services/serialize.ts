/**
 * Convert Mongoose lean documents (ObjectId, Date, ...) into plain
 * JSON-serializable objects safe to pass to Client Components.
 */
export function serialize<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
