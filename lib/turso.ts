/**
 * TURSO LibSQL Client para Agrónomo Guinea Ecuatorial 🇬🇶
 * Soporta conexión directa HTTP de alta velocidad con Turso Cloud (9 GB de almacenamiento)
 * Compatible con Node.js, Vercel Serverless, Edge Functions y Web Workers.
 */

const RAW_URL = process.env.TURSO_DATABASE_URL || 'libsql://agronomo-db-aidasolution.aws-us-west-2.turso.io';
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTExNTczNTEsImlkIjoiMDFhMTA5NGItZWYwMS03MjQ2LTlhMGQtOGFjNWJiOGFmN2I2Iiwia2lkIjoiQ0N6d1dtY3ZiZjJad2J5TjNSdV9HYXY0LTBYTENQRGpBcEZhUXNPWTlHcyIsInJpZCI6IjUxMDY5N2I3LTRlZGItNDA4OS04NTYyLTY2ZWY3ZTBhZWFmZCJ9.KunKiSqfbsLT9VqcrW6guclgml3JEzHlLNfTdTk9cyk8RFQIOkOEfRzkdBRKd6ic8MC4c0wS1zGPDUoZ8u-uDA';

// Convertir libsql:// a https:// si es necesario
const HTTP_URL = RAW_URL.replace(/^libsql:\/\//i, 'https://').replace(/\/$/, '') + '/v2/pipeline';

interface TursoValue {
  type: 'null' | 'integer' | 'float' | 'text' | 'blob';
  value?: any;
}

function mapValue(v: any): TursoValue {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') {
    return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  }
  if (typeof v === 'boolean') {
    return { type: 'integer', value: v ? '1' : '0' };
  }
  return { type: 'text', value: String(v) };
}

function parseRow(cols: { name: string }[], row: TursoValue[]): Record<string, any> {
  const obj: Record<string, any> = {};
  cols.forEach((col, idx) => {
    const item = row[idx];
    if (!item || item.type === 'null') {
      obj[col.name] = null;
    } else if (item.type === 'integer') {
      obj[col.name] = Number(item.value);
    } else {
      obj[col.name] = item.value;
    }
  });
  return obj;
}

export interface TursoQueryResult<T = any> {
  rows: T[];
  rowsAffected: number;
  lastInsertRowid?: number | string;
}

/**
 * Ejecuta una consulta SQL en Turso Cloud
 */
export async function executeTurso<T = any>(sql: string, args: any[] = []): Promise<TursoQueryResult<T>> {
  const formattedArgs = args.map(mapValue);
  
  const payload = {
    requests: [
      {
        type: 'execute',
        stmt: {
          sql,
          args: formattedArgs
        }
      },
      { type: 'close' }
    ]
  };

  const response = await fetch(HTTP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[Turso HTTP ${response.status}]: ${errText}`);
  }

  const data = await response.json();
  const execResult = data.results?.[0];

  if (execResult?.type === 'error') {
    throw new Error(`[Turso Query Error]: ${execResult.error?.message || 'Error desconocido'}`);
  }

  const result = execResult?.response?.result;
  const cols = result?.cols || [];
  const rawRows = result?.rows || [];
  const rows = rawRows.map((r: TursoValue[]) => parseRow(cols, r)) as T[];

  return {
    rows,
    rowsAffected: result?.affected_row_count || 0,
    lastInsertRowid: result?.last_insert_rowid
  };
}

/**
 * Ejecuta múltiples sentencias SQL en una sola transacción
 */
export async function batchTurso(statements: { sql: string; args?: any[] }[]): Promise<any[]> {
  const requests: any[] = statements.map(s => ({
    type: 'execute',
    stmt: {
      sql: s.sql,
      args: (s.args || []).map(mapValue)
    }
  }));
  requests.push({ type: 'close' });

  const response = await fetch(HTTP_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[Turso Batch HTTP ${response.status}]: ${errText}`);
  }

  const data = await response.json();
  return (data.results || []).map((res: any) => {
    if (res.type === 'error') throw new Error(`[Turso Batch Error]: ${res.error?.message}`);
    const result = res.response?.result;
    const cols = result?.cols || [];
    const rawRows = result?.rows || [];
    return rawRows.map((r: TursoValue[]) => parseRow(cols, r));
  });
}
