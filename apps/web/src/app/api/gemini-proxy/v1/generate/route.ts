import { NextRequest } from "next/server";
import { handleGeminiProxyGenerate } from "@/lib/gemini-proxy-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleGeminiProxyGenerate(request);
}
