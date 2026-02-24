import os
import io
from PIL import Image, ImageOps
import requests
from config import SOCIAL_FORMATS, PRINT_FORMATS, DIGITAL_AD_FORMATS
from upload import upload_file

def export_formats(record, output_dir):
    """
    Takes an approved concept record and produces all required output formats using Pillow.
    Resize, crop, and apply DPI/Bleeds where necessary.
    """
    fields = record.get('fields', {})
    record_id = record['id']
    client = fields.get('Client', 'Unknown')
    
    # Ideally download the 'Generated Concept' from Airtable url here
    # Using a placeholder logic for downloading:
    attachments = fields.get('Generated Concept', [])
    if not attachments:
        print(f"Skipping {record_id} - no concept image found.")
        return []
        
    source_url = attachments[0].get('url')
    print(f"Downloading source image for [{client}] Concept {record_id}...")
    
    response = requests.get(source_url)
    response.raise_for_status()
    source_image = Image.open(io.BytesIO(response.content))
    
    # Needs to parse Format Specs from the Airtable Field and apply formatting
    format_specs = fields.get('Format Specs', '')
    # For now, let's assume it's a comma-separated list of keys like "instagram_square, us_letter"
    requested_formats = [f.strip() for f in format_specs.split(',')] if format_specs else []
    
    exports = []
    
    # Create output client dir if not exists
    client_dir = os.path.join(output_dir, client, 'final')
    os.makedirs(client_dir, exist_ok=True)
    
    for fmt in requested_formats:
        spec = None
        if fmt in SOCIAL_FORMATS:
            spec = SOCIAL_FORMATS[fmt]
        elif fmt in PRINT_FORMATS:
            spec = PRINT_FORMATS[fmt]
        elif fmt in DIGITAL_AD_FORMATS:
            spec = DIGITAL_AD_FORMATS[fmt]
            
        if not spec:
            print(f"Format {fmt} not recognized. Skipping.")
            continue
            
        width, height, target_dpi = spec
        print(f"Processing {fmt}: {width}x{height} @ {target_dpi} DPI")
        
        # Crop to fit the aspect ratio
        processed_image = ImageOps.fit(source_image, (width, height), Image.Resampling.LANCZOS)
        
        # Convert to RGB if it's saving as JPEG
        if processed_image.mode != 'RGB':
            processed_image = processed_image.convert('RGB')
            
        generated_export_path = os.path.join(client_dir, f"{record_id}_{fmt}.jpg")
        processed_image.save(generated_export_path, 'JPEG', quality=95, dpi=(target_dpi, target_dpi))
        
        public_url = upload_file(generated_export_path)
        exports.append({"url": public_url})
        
    return exports
