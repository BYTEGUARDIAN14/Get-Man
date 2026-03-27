from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List

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
    return {"message": "APIPlayground Backend Running"}


@api_router.get("/health")
async def health():
    return {"status": "healthy"}


@api_router.post("/ai/explain")
async def explain_response(request: AIExplainRequest):
    try:
        import google.generativeai as genai

        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI key not configured")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction="You are an API response analyst. Always respond with valid JSON only, no markdown, no backticks, no extra text."
        )

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

        response = await model.generate_content_async(prompt)
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
    except json.JSONDecodeError:
        return {
            "whatItMeans": "The AI returned a response that could not be parsed as JSON.",
            "whyItHappened": "The AI model response format was unexpected.",
            "howToFix": "",
            "testCases": ["Retry the request", "Check API endpoint", "Verify request parameters"]
        }
    except Exception as e:
        logging.error(f"AI explain error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


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
