import os
from dotenv import load_dotenv

# Load environment variables from .claude/.env
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.claude', '.env')
load_dotenv(dotenv_path)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
KIE_API_KEY = os.getenv("KIE_API_KEY")
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")

if not all([GOOGLE_API_KEY, KIE_API_KEY, AIRTABLE_API_KEY, AIRTABLE_BASE_ID]):
    print("Warning: Missing one or more API keys in .claude/.env")

AIRTABLE_BASE_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}"
