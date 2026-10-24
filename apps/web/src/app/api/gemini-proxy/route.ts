import { geminiProxyHealth } from "@/lib/gemini-proxy-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return geminiProxyHealth();
}
