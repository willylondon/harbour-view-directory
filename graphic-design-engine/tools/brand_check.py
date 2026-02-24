import base64
import requests
from config import GOOGLE_API_KEY

def check_brand_alignment(concept_image_path, brand_rules_text):
    """
    Uses Google AI vision (Gemini 1.5 Flash) to review a generated concept against the client's brand guidelines
    before entering the Airtable review queue.
    """
    print(f"Running automated brand check on '{concept_image_path}'...")
    
    with open(concept_image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")
        
    prompt = f"""
    Review this generated graphic concept against the following brand rules:
    {brand_rules_text}
    
    Does this image align with the brand rules? Look at color palette, style, and composition.
    Answer with 'PASS' if it looks reasonably compliant, or 'FAIL' followed by a short reason if it massively violates the rules.
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_data
                    }
                }
            ]
        }]
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        result = response.json()
        
        text_response = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        print(f"Brand Check Result:\n{text_response.strip()}")
        
        return 'FAIL' not in text_response.upper()
    except Exception as e:
        print(f"Error invoking brand check API: {e}")
        return False
