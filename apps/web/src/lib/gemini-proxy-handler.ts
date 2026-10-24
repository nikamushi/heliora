import { NextRequest, NextResponse } from "next/server";

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

type GenerateBody = {
  model?: string;
  system_prompt?: string;
  user_message?: string;
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function handleGeminiProxyGenerate(request: NextRequest) {
  const expected = process.env.GEMINI_PROXY_SECRET;
  const geminiKey = process.env.GEMINI_API_KEY;
  const auth = request.headers.get("authorization") || "";

  if (!expected || auth !== `Bearer ${expected}`) {
    return json({ error: "unauthorized" }, 401);
  }
  if (!geminiKey) {
    return json({ error: "gemini_key_missing" }, 500);
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const systemPrompt = (body.system_prompt || "").trim();
  const userMessage = (body.user_message || "").trim();
  if (!systemPrompt || !userMessage) {
    return json(
      { error: "system_prompt and user_message are required" },
      400
    );
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
        "x-goog-api-key": geminiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "fetch_failed";
    return json({ error: "gemini_unreachable", detail }, 502);
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
    parsed = JSON.parse(rawText) as typeof parsed;
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
}

export function geminiProxyHealth() {
  return json({ status: "ok", service: "heliora-gemini-proxy" });
}
