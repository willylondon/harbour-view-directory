import os
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.claude', '.env')
load_dotenv(dotenv_path)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
KIE_API_KEY = os.getenv("KIE_API_KEY")
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")

if not all([GOOGLE_API_KEY, KIE_API_KEY, AIRTABLE_API_KEY, AIRTABLE_BASE_ID]):
    print("Warning: Missing one or more API keys in .claude/.env")

AIRTABLE_BASE_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}"

# Standard Format Library
SOCIAL_FORMATS = {
    "instagram_square":  (1080, 1080, 72),
    "instagram_story":   (1080, 1920, 72),
    "linkedin_post":     (1200, 627,  72),
    "twitter_post":      (1600, 900,  72),
    "facebook_cover":    (851,  315,  72),
}

PRINT_FORMATS = {
    "a4_portrait":       (2480, 3508, 300), # base size, bleed applied in export
    "us_letter":         (2550, 3300, 300),
    "business_card":     (1050, 600,  300),
    "a3_poster":         (3508, 4961, 300),
}

DIGITAL_AD_FORMATS = {
    "leaderboard":         (728, 90, 72),
    "medium_rectangle":    (300, 250, 72),
    "half_page":           (300, 600, 72),
    "wide_skyscraper":     (160, 600, 72),
}
