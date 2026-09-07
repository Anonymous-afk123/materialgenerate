import { z } from "zod";

export const providerModels = {
  openai: ["gpt-5-mini", "gpt-5.1"],
  deepseek: ["deepseek-v4-flash", "deepseek-v4-pro"],
} as const;

export type Provider = keyof typeof providerModels;

export type ThinkingMode = "enabled" | "disabled";

export type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ProviderRequestInput {
  provider: Provider;
  baseUrl?: string;
  model: string;
  messages: ProviderMessage[];
  stream?: boolean;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  thinking?: ThinkingMode;
}

const providerEndpoints: Record<Provider, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
};

export const defaultProviderBaseUrls: Record<Provider, string> = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com",
};

export const providerSchema = z.enum(["openai", "deepseek"]);
export const modelSchema = z.string().trim().min(1).max(100);
export const baseUrlSchema = z.string().trim().min(1).max(500).url().refine((value) => /^https?:\/\//i.test(value), {
  message: "Base URL 必须以 http:// 或 https:// 开头",
});
export const apiKeySchema = z.string().trim().min(10).max(500).meta({
  writeOnly: true,
  description: "供应商 API Key，仅用于保存或测试，不会在响应中返回。",
});

export const byokSchema = z.object({
  provider: providerSchema,
  baseUrl: baseUrlSchema,
  model: modelSchema,
  apiKey: apiKeySchema,
});

export type ByokInput = z.infer<typeof byokSchema>;

export const llmConfigInputSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  provider: providerSchema,
  baseUrl: baseUrlSchema,
  model: modelSchema,
  apiKey: apiKeySchema,
});

export type LlmConfigInput = z.infer<typeof llmConfigInputSchema>;

export function isAllowedModel(provider: string, model: string): boolean {
  return provider === "openai" || provider === "deepseek"
    ? model.trim().length > 0 && model.trim().length <= 100
    : false;
}

export function buildProviderRequest(input: ProviderRequestInput) {
  if (!isAllowedModel(input.provider, input.model)) throw new Error("模型配置无效");
  const messages = input.provider === "openai"
    ? input.messages.map((message) => ({
      ...message,
      role: message.role === "system" ? "developer" : message.role,
    }))
    : input.messages;
  const body = input.provider === "openai"
    ? {
      model: input.model,
      messages,
      stream: Boolean(input.stream),
      max_completion_tokens: input.maxTokens,
    }
    : {
      model: input.model,
      messages,
      stream: Boolean(input.stream),
      temperature: input.temperature,
      top_p: input.topP,
      max_tokens: input.maxTokens,
      ...(input.thinking ? { thinking: { type: input.thinking } } : {}),
    };
  const configuredBaseUrl = input.baseUrl?.trim().replace(/\/+$/, "");
  const baseUrl = configuredBaseUrl || defaultProviderBaseUrls[input.provider];
  const url = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  return { url: url || providerEndpoints[input.provider], body };
}
