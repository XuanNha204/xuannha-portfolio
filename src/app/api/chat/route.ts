import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { getChatProviders } from "@/lib/chat-providers";
import { getProfile, getSkills, getSocialLinks } from "@/services/profile.service";
import { getPublishedProjects } from "@/services/project.service";
import { getSiteSettings } from "@/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const textPart = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(4000),
});
const imagePart = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string().startsWith("data:image/").max(8_000_000),
  }),
});
const messageContent = z.union([
  z.string().min(1).max(4000),
  z.array(z.union([textPart, imagePart])).min(1).max(6),
]);

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: messageContent,
      })
    )
    .min(1)
    .max(20),
});

/** Ghép ngữ cảnh portfolio thành system prompt cho trợ lý AI. */
async function buildSystemPrompt(): Promise<string> {
  const [settings, profile, projects, skills, socials] = await Promise.all([
    getSiteSettings(),
    getProfile(),
    getPublishedProjects(8),
    getSkills(),
    getSocialLinks(),
  ]);

  const skillLine = skills.length ? skills.map((s) => s.name).join(", ") : "chưa cập nhật";

  const projectLines = projects.length
    ? projects
        .map((p) => {
          const tech = p.techStack?.length ? ` (${p.techStack.join(", ")})` : "";
          const summary = p.summary ? ` — ${p.summary}` : "";
          return `- ${p.title}${tech}${summary} → link: /projects/${p.slug}`;
        })
        .join("\n")
    : "- (chưa có dự án công khai)";

  const socialLines = socials.length
    ? socials.map((s) => `- ${s.label || s.platform}: ${s.url}`).join("\n")
    : "- (chưa có)";

  return [
    `Bạn là trợ lý AI trên website portfolio "${settings.siteName}".`,
    `Nhiệm vụ: trả lời khách tham quan về ${profile.name} và công việc của họ một cách thân thiện, ngắn gọn, chính xác.`,
    "",
    "## Thông tin chủ nhân",
    `- Tên: ${profile.name}`,
    profile.headline ? `- Chức danh: ${profile.headline}` : "",
    profile.location ? `- Địa điểm: ${profile.location}` : "",
    profile.email ? `- Email liên hệ: ${profile.email}` : "",
    profile.careerGoal ? `- Mục tiêu nghề nghiệp: ${profile.careerGoal}` : "",
    profile.about ? `- Giới thiệu: ${profile.about}` : "",
    "",
    `## Kỹ năng\n${skillLine}`,
    "",
    `## Dự án tiêu biểu\n${projectLines}`,
    "",
    `## Mạng xã hội\n${socialLines}`,
    "",
    "## Các trang nội bộ",
    "- Danh sách dự án: /projects",
    "- Blog: /blog",
    "- Giới thiệu: /about",
    "- Liên hệ: /contact",
    "",
    "## Quy tắc",
    "- Trả lời bằng đúng ngôn ngữ mà người dùng đang dùng (Việt/Anh/Trung).",
    "- Chỉ dựa vào thông tin ở trên; nếu không biết, hãy nói thẳng và gợi ý dùng trang Liên hệ.",
    "- Giữ câu trả lời gọn (thường dưới 6 câu), giọng điệu chuyên nghiệp và gần gũi.",
    "- Không bịa thông tin cá nhân, số liệu hay dự án không có trong dữ liệu.",
    "- Khi nhắc tới một dự án hoặc trang cụ thể, HÃY chèn liên kết Markdown nội bộ dạng [Tên dự án](/projects/slug) hoặc [Xem tất cả dự án](/projects) để người dùng bấm vào. Luôn dùng đúng đường dẫn ở trên, bắt đầu bằng dấu /.",
    "- Sau khi trả lời, nếu phù hợp, gợi ý 1-2 liên kết liên quan để người dùng khám phá tiếp.",
    "- Nếu người dùng gửi kèm hình ảnh, hãy đọc nội dung trong ảnh và trả lời dựa trên đó.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Chuyển SSE (OpenAI-compatible) của provider thành luồng text thuần cho client. */
function sseToTextStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = body.getReader();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Chunk chưa parse được — ghép ở vòng sau.
            }
          }
        }
      } catch {
        // Ngắt luồng: kết thúc êm để client giữ phần đã nhận.
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

export async function POST(req: NextRequest) {
  const providers = getChatProviders();
  if (providers.length === 0) {
    return jsonError("Chatbot chưa được cấu hình (chưa có API key nào).", 503);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = rateLimit(`chat:${ip}`, { limit: 15, windowMs: 60_000 });
  if (!success) {
    return jsonError("Bạn nhắn quá nhanh, vui lòng thử lại sau ít phút.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Dữ liệu không hợp lệ.", 400);
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Nội dung tin nhắn không hợp lệ.", 400);
  }

  const systemPrompt = await buildSystemPrompt();
  const messages = [
    { role: "system", content: systemPrompt },
    ...parsed.data.messages,
  ];

  // Thử lần lượt từng provider; lỗi thì tự chuyển sang provider kế tiếp.
  for (const provider of providers) {
    let upstream: Response;
    try {
      upstream = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          stream: true,
          temperature: 0.7,
          messages,
        }),
      });
    } catch (err) {
      console.warn(`[chat] provider "${provider.id}" lỗi kết nối, thử cái kế tiếp.`, err);
      continue;
    }

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      console.warn(
        `[chat] provider "${provider.id}" trả HTTP ${upstream.status}, thử cái kế tiếp. ${detail.slice(0, 200)}`
      );
      continue;
    }

    return new Response(sseToTextStream(upstream.body), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Chat-Provider": provider.id,
        "X-Chat-Model": provider.model,
      },
    });
  }

  return jsonError("Tất cả dịch vụ AI hiện không phản hồi, vui lòng thử lại sau.", 502);
}
