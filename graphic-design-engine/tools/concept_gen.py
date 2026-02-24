import os
import requests
import base64
from config import GOOGLE_API_KEY
from upload import upload_file

def generate_concept_batch(records):
    """
    Accepts a list of Airtable records with concept prompts.
    Sends prompt to Google AI API (Imagen 3).
    Uploads generated concepts to Kie.ai and updates Airtable.
    """
    print("Starting batch concept generation using Google AI Studio...")
    updates = []
    
    for record in records:
        record_id = record['id']
        fields = record.get('fields', {})
        prompt = fields.get('Concept Prompt', '')
        client = fields.get('Client', 'Unknown')
        
        print(f"Generating concept for [{client}]: {prompt}")
        
        # Google AI Endpoint for Imagen (example with generativelanguage API)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={GOOGLE_API_KEY}"
        
        payload = {
            "instances": [
                {"prompt": prompt}
            ],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": "1:1"
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            
            # The API returns predictions containing bytesBase64Encoded
            data = response.json()
            b64_image = data.get('predictions', [{}])[0].get('bytesBase64Encoded', '')
            
            if not b64_image:
                print(f"Failed to generate valid image for {record_id}")
                continue
                
            generated_concept_path = f"generated_concept_{record_id}.jpg"
            
            with open(generated_concept_path, "wb") as f:
                f.write(base64.b64decode(b64_image))
                
            public_url = upload_file(generated_concept_path)
            
            updates.append((record_id, {
                "Concept Status": "Generated",
                "Generated Concept": [{"url": public_url}]
            }))
            
            # Cleanup local
            if os.path.exists(generated_concept_path):
                os.remove(generated_concept_path)
                
        except Exception as e:
            print(f"Error generating concept for {record_id}: {e}")
            
    return updates
