require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('\nMissing DATABASE_URL in .env.local');
    console.log('To get this:');
    console.log('1. Go to Supabase Dashboard -> Project Settings -> Database');
    console.log('2. Scroll down to "Connection String" -> URI');
    console.log('3. Copy the URI, replace [YOUR-PASSWORD] with your actual database password');
    console.log('4. Add DATABASE_URL="postgresql://postgres.[project]..." to your .env.local file');
    process.exit(1);
}

async function deploySchema() {
    console.log('Connecting to Supabase PostgreSQL database...');

    const client = new Client({
        connectionString,
        // Required for Supabase connecting from external networks sometimes
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully!');

        console.log('Reading schema.sql file...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema script on the server...');
        await client.query(schemaSql);

        console.log('✅ Schema deployed successfully! The tables and policies have been created.');

    } catch (err) {
        console.error('❌ Failed to deploy schema:', err.message);
    } finally {
        await client.end();
    }
}

deploySchema();
