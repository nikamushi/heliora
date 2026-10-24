/**
 * HELIORA — Gemini generateContent proxy (Cloudflare Worker).
 *
 * VPS egress in unsupported regions fails Google's location check.
 * This Worker calls Gemini from Cloudflare egress instead.
 *
 * POST /v1/generate
 *   Authorization: Bearer <PROXY_SECRET>
 *   Body: { model?, system_prompt, user_message }
 *   → { text: string }
 */

export interface Env {
  GEMINI_API_KEY: string;
  PROXY_SECRET: string;
}

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

type GenerateBody = {
  model?: string;
  system_prompt?: string;
  user_message?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function unauthorized(): Response {
  return json({ error: "unauthorized" }, 401);
}

function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok", service: "heliora-gemini-proxy" });
    }

    if (request.method !== "POST" || url.pathname !== "/v1/generate") {
      return json({ error: "not_found" }, 404);
    }

    const auth = request.headers.get("authorization") || "";
    const expected = `Bearer ${env.PROXY_SECRET}`;
    if (!env.PROXY_SECRET || auth !== expected) {
      return unauthorized();
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: "gemini_key_missing" }, 500);
    }

    let body: GenerateBody;
    try {
      body = (await request.json()) as GenerateBody;
    } catch {
      return badRequest("invalid_json");
    }

    const systemPrompt = (body.system_prompt || "").trim();
    const userMessage = (body.user_message || "").trim();
    if (!systemPrompt || !userMessage) {
      return badRequest("system_prompt and user_message are required");
    }

    const model = (body.model || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
    const geminiUrl = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`;

    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    };

    let geminiRes: Response;
    try {
      geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "fetch_failed";
      return json({ error: "gemini_unreachable", detail: message }, 502);
    }

    const rawText = await geminiRes.text();
    if (!geminiRes.ok) {
      return json(
        {
          error: "gemini_http_error",
          status: geminiRes.status,
          detail: rawText.slice(0, 500),
        },
        502
      );
    }

    let parsed: {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return json({ error: "gemini_invalid_json" }, 502);
    }

    const text = (parsed.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

    if (!text) {
      return json({ error: "gemini_empty_response" }, 502);
    }

    return json({ text });
  },
};
