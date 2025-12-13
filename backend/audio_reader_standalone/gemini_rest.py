"""
Pure Python REST client for Gemini API - no gRPC/C++ dependencies
"""
import os
import json
import requests
import logging

logger = logging.getLogger(__name__)

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiModel:
    """Simple REST-based Gemini client that mimics google.generativeai interface"""
    
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.api_key = os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set")
        self.model_name = model_name
    
    def generate_content(self, prompt: str, generation_config: dict = None) -> 'GenerateResponse':
        """Generate content using Gemini REST API"""
        url = f"{GEMINI_API_BASE}/models/{self.model_name}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        if generation_config:
            payload["generationConfig"] = {}
            if "temperature" in generation_config:
                payload["generationConfig"]["temperature"] = generation_config["temperature"]
            if "max_output_tokens" in generation_config:
                payload["generationConfig"]["maxOutputTokens"] = generation_config["max_output_tokens"]
        
        headers = {"Content-Type": "application/json"}
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            response.raise_for_status()
            return GenerateResponse(response.json())
        except requests.exceptions.RequestException as e:
            logger.error(f"Gemini API request failed: {e}")
            raise


class GenerateResponse:
    """Response wrapper to mimic google.generativeai response structure"""
    
    def __init__(self, data: dict):
        self._data = data
        self.text = self._extract_text()
    
    def _extract_text(self) -> str:
        try:
            candidates = self._data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    return parts[0].get("text", "")
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to extract text from response: {e}")
        return ""


class GenerativeModel:
    """Drop-in replacement for genai.GenerativeModel"""
    
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        # Map old model names to new ones
        model_mapping = {
            "gemini-1.5-pro": "gemini-1.5-pro",
            "gemini-1.5-flash": "gemini-1.5-flash", 
            "gemini-pro": "gemini-1.5-flash",
            "gemini-2.5-pro": "gemini-2.0-flash",  # Use available model
        }
        self.model = GeminiModel(model_mapping.get(model_name, model_name))
    
    def generate_content(self, prompt: str, generation_config: dict = None) -> GenerateResponse:
        return self.model.generate_content(prompt, generation_config)


def configure(api_key: str = None):
    """Configure API key (for compatibility - we use env var instead)"""
    if api_key:
        os.environ["GOOGLE_API_KEY"] = api_key
