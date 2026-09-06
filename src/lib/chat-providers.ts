type Definition = { id: string; prefix: string; base: string; model: string };
export type ChatProvider = { id: string; apiKey: string; baseUrl: string; model: string };
type Health = { failures: number; lastFailureAt: number; blockedUntil: number };
const health = new Map<string, Health>();
const definitions: Definition[] = [
  { id: "llama", prefix: "LLAMA", base: "https://integrate.api.nvidia.com/v1", model: "nvidia/nemotron-3-super-120b-a12b" },
  { id: "openai", prefix: "OPENAI", base: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { id: "deepseek", prefix: "DEEPSEEK", base: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { id: "gemini", prefix: "GEMINI", base: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.5-flash" },
];
export function getChatProviders() {
  const order = (process.env.CHAT_PROVIDER_ORDER || "llama,openai,deepseek,gemini").split(",").map((id) => id.trim());
  return [...new Set(order)].flatMap((id) => {
    const definition = definitions.find((item) => item.id === id);
    if (!definition) return [];
    const apiKey = process.env[definition.prefix + "_API_KEY"]?.trim();
    if (!apiKey) return [];
    const baseUrl = (process.env[definition.prefix + "_BASE_URL"] || definition.base).replace(/\/+$/, "");
    return (process.env[definition.prefix + "_MODEL"] || definition.model).split(",").filter(Boolean).map((model) => ({ id, apiKey, baseUrl, model: model.trim() }));
  });
}

function providerKey(provider: ChatProvider) {
  return `${provider.id}:${provider.baseUrl}:${provider.model}`;
}

export function isProviderAvailable(provider: ChatProvider) {
  const state = health.get(providerKey(provider));
  if (!state) return true;
  const now = Date.now();
  if (state.lastFailureAt + 5 * 60_000 <= now) {
    health.delete(providerKey(provider));
    return true;
  }
  return state.blockedUntil <= now;
}

export function recordProviderFailure(provider: ChatProvider) {
  const key = providerKey(provider);
  const previous = health.get(key);
  const now = Date.now();
  const failures = previous && previous.lastFailureAt + 5 * 60_000 > now
    ? previous.failures + 1
    : 1;
  health.set(key, {
    failures,
    lastFailureAt: now,
    blockedUntil: failures >= 3 ? now + 2 * 60_000 : 0,
  });
}

export function recordProviderSuccess(provider: ChatProvider) {
  health.delete(providerKey(provider));
}
