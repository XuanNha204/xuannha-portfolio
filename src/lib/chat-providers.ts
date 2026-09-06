type Definition = { id: string; prefix: string; base: string; model: string };
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
