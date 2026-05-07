'use strict';

require('dotenv').config({ path: '.env.local', quiet: true });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL.trim(), SUPABASE_SERVICE_ROLE_KEY.trim(), {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OUTPUT_DIR = path.join(process.cwd(), 'scripts');
const VENDORS_PATH = path.join(OUTPUT_DIR, 'current_production_vendors.json');
const RENTALS_PATH = path.join(OUTPUT_DIR, 'current_production_rentals.json');

function writeExport(filePath, table, records) {
  const payload = {
    exported_at: new Date().toISOString(),
    source: 'production',
    table,
    count: records.length,
    records,
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

async function exportTable(table) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    throw error;
  }
  return data || [];
}

async function exportOptionalTable(table) {
  try {
    return await exportTable(table);
  } catch (error) {
    if (error && (error.code === '42P01' || /Could not find the table/i.test(error.message || ''))) {
      return null;
    }
    throw error;
  }
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const vendors = await exportTable('vendors');
  writeExport(VENDORS_PATH, 'vendors', vendors);
  console.log(`vendors exported: ${vendors.length}`);

  const rentals = await exportOptionalTable('rentals');
  if (rentals) {
    writeExport(RENTALS_PATH, 'rentals', rentals);
    console.log(`rentals exported: ${rentals.length}`);
  } else {
    console.log('rentals exported: skipped (table not found)');
  }
}

run().catch((error) => {
  console.error(`Production export failed: ${error.message}`);
  process.exit(1);
});
