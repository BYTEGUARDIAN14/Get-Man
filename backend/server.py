from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import uuid
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
from google import genai
from google.genai import types

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class AIExplainRequest(BaseModel):
    method: str
    url: str
    status: int
    body: str


@api_router.get("/")
async def root():
    return {"message": "Apico Backend Running"}


@api_router.get("/health")
async def health():
    return {"status": "healthy"}


@api_router.post("/ai/explain")
async def explain_response(request: AIExplainRequest):
    try:
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return JSONResponse(status_code=500, content={"error": "AI key not configured"})

        # Initialize the new SDK client
        genai_client = genai.Client(api_key=api_key)
        
        body_preview = request.body[:2000] if len(request.body) > 2000 else request.body

        prompt = f"""Analyze the following API response and return ONLY a JSON object with no markdown, no backticks, no extra text:
{{
  "whatItMeans": "Plain English explanation of what this response means, 2-3 sentences",
  "whyItHappened": "Root cause explanation, 2-3 sentences",
  "howToFix": "Step by step fix instructions as a single string with numbered steps separated by newlines. Return empty string if status is 2xx",
  "testCases": ["test case 1", "test case 2", "test case 3"]
}}
API Details:
Method: {request.method}
URL: {request.url}
Status: {request.status}
Response Body: {body_preview}"""

        try:
            # Use the new SDK generation with a timeout
            response = await asyncio.wait_for(
                genai_client.aio.models.generate_content(
                    model='models/gemini-3-flash-preview',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction="You are an API response analyst. Always respond with valid JSON only, no markdown, no backticks, no extra text."
                    )
                ),
                timeout=25.0
            )
            
            response_text = response.text

            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                cleaned = "\n".join(lines[1:])
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

            result = json.loads(cleaned)
            return result
        except asyncio.TimeoutError:
            return JSONResponse(status_code=504, content={"error": "AI request timed out. Please try again."})
        except json.JSONDecodeError:
            return {
                "whatItMeans": "The AI returned a response that could not be parsed as JSON.",
                "whyItHappened": "The AI model response format was unexpected.",
                "howToFix": "",
                "testCases": ["Retry the request", "Check API endpoint", "Verify request parameters"]
            }
    except Exception as e:
        logging.error(f"AI explain error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": "AI analysis failed. Check your API key and try again."})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
