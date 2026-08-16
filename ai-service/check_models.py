# ai-service/check_models.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit()

print("Fetching available models directly from Google's REST API...\n")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)

if response.status_code == 200:
    models = response.json().get('models', [])
    valid_models = []
    
    for m in models:
        # We need models that support content generation
        if 'generateContent' in m.get('supportedGenerationMethods', []):
            model_name = m['name'].replace('models/', '')
            valid_models.append(model_name)
            
    print("✅ Here are the models your API key can use right now:\n")
    for name in valid_models:
        print(f" - {name}")
        
    print("\n👉 Look for a standard flash model in the list above (e.g., 'gemini-1.5-flash' or 'gemini-2.0-flash').")
else:
    print(f"Error {response.status_code}: {response.text}")