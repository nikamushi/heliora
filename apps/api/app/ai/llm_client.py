"""HELIORA API — Gemini client for the LLM explanation pipeline (LLM-001).

Implements PRD FR-030 (generation) and BR-LLM-000 (non-blocking): every
failure mode maps to LLMUnavailableError so the caller can fall back to a
deterministic template. The API key travels in the `x-goog-api-key` header
(never in logs) and is only ever read from the environment.
"""

import httpx

_GENERATE_CONTENT_PATH = "https://generativelanguage.googleapis.com/v1beta/models"


class LLMUnavailableError(Exception):
    """Raised when the LLM cannot produce an explanation (any reason)."""


class GeminiClient:
    """Minimal async client for the Gemini generateContent REST endpoint."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str = "gemini-3.5-flash-lite",
        timeout_seconds: float = 10.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._timeout_seconds = timeout_seconds
        self._transport = transport

    async def generate_text(self, system_prompt: str, user_message: str) -> str:
        """Generate one explanation text. Raises LLMUnavailableError on failure."""
        if not self._api_key:
            raise LLMUnavailableError("GEMINI_API_KEY is not configured.")

        url = f"{_GENERATE_CONTENT_PATH}/{self._model}:generateContent"
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"parts": [{"text": user_message}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1024},
        }
        try:
            async with httpx.AsyncClient(
                timeout=self._timeout_seconds, transport=self._transport
            ) as client:
                response = await client.post(
                    url,
                    headers={"x-goog-api-key": self._api_key},
                    json=payload,
                )
                response.raise_for_status()
        except (httpx.TimeoutException, httpx.HTTPStatusError) as exc:
            raise LLMUnavailableError(f"Gemini request failed: {exc}") from exc

        try:
            parts = response.json()["candidates"][0]["content"]["parts"]
            text = "".join(part.get("text", "") for part in parts).strip()
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise LLMUnavailableError(f"Unexpected Gemini response: {exc}") from exc
        if not text:
            raise LLMUnavailableError("Gemini returned an empty response.")
        return text
