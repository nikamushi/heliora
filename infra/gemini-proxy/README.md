# HELIORA Gemini Proxy (Cloudflare Worker)

Proxies `generateContent` so the VPS API in an unsupported Google region can still use Gemini for assessment explanations.

> **Production note:** If `*.workers.dev` TLS is not yet ready on a new Cloudflare
> account, use the equivalent Next.js route on Vercel instead:
> `https://heliora.software/api/gemini-proxy` (same `/v1/generate` contract).
> Set `GEMINI_API_KEY` + `GEMINI_PROXY_SECRET` in the Vercel project env.

## Deploy (Cloudflare)

```bash
cd infra/gemini-proxy
pnpm install   # or npm install
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put PROXY_SECRET
npx wrangler deploy
```

Copy the `*.workers.dev` URL into VPS `GEMINI_PROXY_URL` (no trailing slash).

## VPS env

```env
# Prefer Vercel proxy while workers.dev SSL is unavailable:
GEMINI_PROXY_URL=https://heliora.software/api/gemini-proxy
# Or Cloudflare Worker when TLS works:
# GEMINI_PROXY_URL=https://heliora-gemini-proxy.heliora.workers.dev
GEMINI_PROXY_SECRET=<same value as Worker / Vercel GEMINI_PROXY_SECRET>
GEMINI_MODEL=gemini-3.5-flash-lite
# GEMINI_API_KEY not required on VPS when proxy is set
```

Then recreate the API container.

## API

`POST /v1/generate` (Worker) or `POST /api/gemini-proxy/v1/generate` (Vercel)

```http
Authorization: Bearer <PROXY_SECRET>
Content-Type: application/json

{ "model": "gemini-3.5-flash-lite", "system_prompt": "...", "user_message": "..." }
```

Response: `{ "text": "..." }`
