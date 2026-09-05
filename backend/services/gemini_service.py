import os
import json
import re
from google import genai
from google.genai.errors import APIError

class GeminiRotator:
    def __init__(self):
        self.keys = self._load_keys()
        self.current_index = 0

    def _load_keys(self) -> list:
        keys = []
        keys_env = os.getenv("GEMINI_API_KEYS")
        if keys_env:
            keys.extend([k.strip() for k in keys_env.split(",") if k.strip() and k.strip() != "your_gemini_api_key_here"])
        for env_var, value in os.environ.items():
            if env_var.startswith("GEMINI_API_KEY") and value and value != "your_gemini_api_key_here":
                if value not in keys:
                    keys.append(value)
        return keys

    def get_current_key(self):
        if not self.keys:
            return None
        return self.keys[self.current_index]

    def rotate_key(self):
        if not self.keys:
            return False
        self.current_index = (self.current_index + 1) % len(self.keys)
        return True

    def generate_content(self, prompt: str, model_name: str = 'gemini-1.5-flash', max_retries: int = None):
        if not self.keys:
            raise ValueError("No Gemini API keys configured.")
        if max_retries is None:
            max_retries = len(self.keys)
        attempts = 0
        while attempts < max_retries:
            key = self.get_current_key()
            client = genai.Client(api_key=key)
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                return response
            except APIError as e:
                import traceback
                traceback.print_exc()
                print(f"DEBUG: APIError caught with code {e.code}: {e}")
                if e.code == 429:
                    print(f"Rate limit hit for key index {self.current_index}. Rotating API key...")
                    self.rotate_key()
                    attempts += 1
                else:
                    raise e
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"DEBUG: Exception caught: {e}")
                if "429" in str(e):
                    print(f"Rate limit (429) hit for key index {self.current_index}. Rotating API key...")
                    self.rotate_key()
                    attempts += 1
                else:
                    raise e
        raise Exception("All Gemini API keys exhausted or rate limited.")

    def generate_json_content(self, prompt: str, model_name: str = 'gemini-1.5-flash', max_retries: int = None) -> dict:
        response = self.generate_content(prompt, model_name, max_retries)
        text = response.text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return {"raw_text": text}

gemini_rotator = GeminiRotator()
