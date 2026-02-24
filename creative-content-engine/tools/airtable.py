import requests
from config import AIRTABLE_API_KEY, AIRTABLE_BASE_URL

HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

def create_records(table_name, records):
    """Batch create up to 10 records at a time."""
    url = f"{AIRTABLE_BASE_URL}/{table_name}"
    responses = []
    
    for i in range(0, len(records), 10):
        batch = records[i:i+10]
        data = {"records": [{"fields": record} for record in batch]}
        response = requests.post(url, headers=HEADERS, json=data)
        response.raise_for_status()
        responses.extend(response.json().get('records', []))
        
    return responses

def read_records(table_name, filter_by_formula=None):
    """Read records with optional filtering."""
    url = f"{AIRTABLE_BASE_URL}/{table_name}"
    params = {}
    if filter_by_formula:
        params["filterByFormula"] = filter_by_formula
    
    records = []
    while True:
        response = requests.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()
        records.extend(data.get('records', []))
        
        if 'offset' in data:
            params['offset'] = data['offset']
        else:
            break
            
    return records

def update_records(table_name, updates):
    """Batch update records."""
    url = f"{AIRTABLE_BASE_URL}/{table_name}"
    responses = []
    
    for i in range(0, len(updates), 10):
        batch = updates[i:i+10]
        data = {"records": [{"id": record_id, "fields": fields} for record_id, fields in batch]}
        response = requests.patch(url, headers=HEADERS, json=data)
        response.raise_for_status()
        responses.extend(response.json().get('records', []))
        
    return responses
