from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

from google import genai

logger = logging.getLogger(__name__)


class GeminiNotConfigured(RuntimeError):
    """Raised when no Gemini API credential is available to the process."""


class GeminiGateway:
    """Small async boundary around the synchronous google-genai client."""

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    def _client(self) -> genai.Client:
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise GeminiNotConfigured(
                "GEMINI_API_KEY is not configured; set it in backend/.env "
                "or export it before starting FastAPI."
            )
        return genai.Client(api_key=self.api_key)

    @staticmethod
    def _parse_json_response(raw: str | None) -> dict[str, Any]:
        """Parse JSON returned either plainly or inside a markdown code fence."""
        text = (raw or "").strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if lines and lines[0].strip().startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        try:
            value = json.loads(text)
        except json.JSONDecodeError:
            decoder = json.JSONDecoder()
            start = text.find("{")
            if start < 0:
                raise ValueError("Gemini returned no JSON object") from None
            try:
                value, _ = decoder.raw_decode(text[start:])
            except json.JSONDecodeError as exc:
                raise ValueError("Gemini returned invalid JSON") from exc

        if not isinstance(value, dict):
            raise ValueError("Gemini response must be a JSON object")
        return value

    async def generate_json(self, model: str, prompt: str, contents: Any = None) -> dict[str, Any]:
        def call() -> Any:
            client = self._client()
            response = client.models.generate_content(
                model=model,
                contents=contents if contents is not None else prompt,
                config={"response_mime_type": "application/json"},
            )
            return response.text

        try:
            raw = await asyncio.to_thread(call)
            return self._parse_json_response(raw)
        except Exception:
            logger.exception("Gemini JSON request failed for model %s", model)
            raise


gemini = GeminiGateway()
