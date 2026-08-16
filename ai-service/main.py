import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Civic Resilience AI Service")

@app.get("/")
async def root():
    return {
        "message": "Civic Resilience AI Service is running.",
        "documentation": "Visit /docs to test the API."
    }

client = genai.Client()

# --- Pydantic Models ---

# 1. Schema for the incoming request from the Node.js backend
class ReportRequest(BaseModel):
    text: str = Field(..., description="The raw civic report text from the user")

# 2. Schema to force Gemini to return exactly this JSON structure
class AIAnalysisResponse(BaseModel):
    translatedText: str = Field(..., description="The text translated into English. If already English, return as is.")
    language: str = Field(..., description="The original language of the text (e.g., 'English', 'Tamil', 'Spanish').")
    sdgCategory: int = Field(..., description="The UN Sustainable Development Goal number (1-17) that best matches the crisis.")
    severityLevel: str = Field(..., description="The severity of the crisis. Must be exactly one of: Low, Medium, High, Critical")

# --- System Prompt ---
SYSTEM_INSTRUCTION = """
You are an expert AI triage analyst for a civic resilience platform. 
Analyze the provided civic report and extract the required information.
If the report is not in English, translate it to English.
Determine the most relevant UN Sustainable Development Goal (SDG) integer (1 to 17).
Determine the severity level (Low, Medium, High, Critical) based on immediate risk to human life or infrastructure.
"""

# --- API Endpoints ---

@app.post("/api/analyze", response_model=AIAnalysisResponse)
async def analyze_report(request: ReportRequest):
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        # 1. Use client.chats.create to resolve the AFC warning
        # 2. Use gemini-2.0-flash as the correct model string
        chat = client.chats.create(
            model="gemini-3.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=AIAnalysisResponse,
            )
        )
        
        # Send the raw text to the chat session
        response = chat.send_message(request.text)
        
        # Parse and return the guaranteed JSON structure
        result_dict = json.loads(response.text)
        return result_dict

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing text with AI service")

@app.get("/health")
async def health_check():
    return {"status": "AI Service is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)