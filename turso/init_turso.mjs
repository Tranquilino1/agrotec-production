import fs from 'fs';
import path from 'path';

const TURSO_URL = 'https://agronomo-db-aidasolution.aws-us-west-2.turso.io/v2/pipeline';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTExNTczNTEsImlkIjoiMDFhMTA5NGItZWYwMS03MjQ2LTlhMGQtOGFjNWJiOGFmN2I2Iiwia2lkIjoiQ0N6d1dtY3ZiZjJad2J5TjNSdV9HYXY0LTBYTENQRGpBcEZhUXNPWTlHcyIsInJpZCI6IjUxMDY5N2I3LTRlZGItNDA4OS04NTYyLTY2ZWY3ZTBhZWFmZCJ9.KunKiSqfbsLT9VqcrW6guclgml3JEzHlLNfTdTk9cyk8RFQIOkOEfRzkdBRKd6ic8MC4c0wS1zGPDUoZ8u-uDA';

async function executeStatements() {
  const schemaPath = path.resolve('c:/Users/RYESA/Desktop/resources/agronomo_pwa/turso/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Remove block comments and line comments cleanly
  const cleanedSql = schemaSql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '');

  const statements = cleanedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements on Turso (agronomo-db)...`);

  const requests = statements.map(sql => ({
    type: 'execute',
    stmt: { sql }
  }));
  requests.push({ type: 'close' });

  const response = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Turso HTTP Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('Turso Execution Results:');
  result.results.forEach((res, i) => {
    if (res.type === 'error') {
      console.error(`Statement ${i + 1} Error:`, res.error);
    } else {
      console.log(`Statement ${i + 1} Success (${res.type})`);
    }
  });

  // Verify created tables
  console.log('\nVerifying tables created in Turso...');
  const verifyResp = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: { sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" }
        },
        {
          type: 'execute',
          stmt: { sql: "SELECT COUNT(*) as count FROM activation_codes;" }
        },
        { type: 'close' }
      ]
    })
  });

  const verifyResult = await verifyResp.json();
  console.log('SQLite Master Tables:', JSON.stringify(verifyResult.results[0]?.response?.result?.rows || []));
  console.log('Activation Codes Count:', JSON.stringify(verifyResult.results[1]?.response?.result?.rows || []));
}

executeStatements().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
