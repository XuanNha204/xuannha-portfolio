/**
 * Registry các nhà cung cấp AI cho chatbot.
 *
 * Tất cả đều dùng chuẩn OpenAI-compatible (POST {baseUrl}/chat/completions,
 * Bearer key, stream SSE với choices[].delta.content) — kể cả Gemini qua
 * endpoint OpenAI-compat của Google.
 *
 * Thêm provider mới = thêm 1 dòng vào DEFINITIONS + điền 3 biến env
 * (key / base url / model). Provider nào chưa có key sẽ tự bị bỏ qua.
 *
 * MỖI biến *_MODEL có thể là DANH SÁCH model cách nhau bằng dấu phẩy — dùng
 * chung 1 key/base url. Model đầu quá tải/lỗi thì tự thử model kế tiếp.
 * Vd: LLAMA_MODEL="meta/llama-4-maverick-17b-128e-instruct,meta/llama-3.1-8b-instruct"
 */

export type ProviderId = "llama" | "openai" | "gemini" | "deepseek";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

function splitModels(value: string): string[] {
  return value
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

interface ProviderDefinition {
  id: ProviderId;
  label: string;
  keyEnv: string;
  baseUrlEnv: string;
  baseUrlDefault: string;
  modelEnv: string;
  modelDefault: string;
}

const DEFINITIONS: ProviderDefinition[] = [
  {
    id: "llama",
    label: "Llama (NVIDIA)",
    keyEnv: "LLAMA_API_KEY",
    baseUrlEnv: "LLAMA_BASE_URL",
    baseUrlDefault: "https://integrate.api.nvidia.com/v1",
    modelEnv: "LLAMA_MODEL",
    modelDefault: "meta/llama-4-maverick-17b-128e-instruct",
  },
  {
    id: "openai",
    label: "OpenAI",
    keyEnv: "OPENAI_API_KEY",
    baseUrlEnv: "OPENAI_BASE_URL",
    baseUrlDefault: "https://api.openai.com/v1",
    modelEnv: "OPENAI_MODEL",
    modelDefault: "gpt-4o-mini",
  },
  {
    id: "gemini",
    label: "Gemini",
    keyEnv: "GEMINI_API_KEY",
    baseUrlEnv: "GEMINI_BASE_URL",
    baseUrlDefault: "https://generativelanguage.googleapis.com/v1beta/openai",
    modelEnv: "GEMINI_MODEL",
    modelDefault: "gemini-2.0-flash",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    keyEnv: "DEEPSEEK_API_KEY",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
    baseUrlDefault: "https://api.deepseek.com/v1",
    modelEnv: "DEEPSEEK_MODEL",
    modelDefault: "deepseek-chat",
  },
];

function env(name: string): string {
  return process.env[name]?.trim() || "";
}

/**
 * Trả về danh sách provider ĐÃ CÓ KEY, theo thứ tự ưu tiên failover.
 * Thứ tự mặc định = thứ tự khai báo trong DEFINITIONS; có thể ghi đè bằng
 * CHAT_PROVIDER_ORDER="openai,gemini,deepseek,llama".
 */
export function getChatProviders(): ProviderConfig[] {
  const orderEnv = env("CHAT_PROVIDER_ORDER");
  const order = orderEnv
    ? orderEnv.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFINITIONS.map((d) => d.id);

  const byId = new Map(DEFINITIONS.map((d) => [d.id, d] as const));
  const result: ProviderConfig[] = [];
  const seen = new Set<string>();

  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    const def = byId.get(id as ProviderId);
    if (!def) continue;

    const apiKey = env(def.keyEnv);
    if (!apiKey) continue; // chưa có key → bỏ qua

    const baseUrl = (env(def.baseUrlEnv) || def.baseUrlDefault).replace(/\/+$/, "");
    const models = splitModels(env(def.modelEnv) || def.modelDefault);

    // Mỗi model → 1 ứng viên failover, dùng chung key + base url của provider.
    for (const model of models) {
      result.push({
        id: def.id,
        label: models.length > 1 ? `${def.label} · ${model}` : def.label,
        baseUrl,
        apiKey,
        model,
      });
    }
  }

  return result;
}
