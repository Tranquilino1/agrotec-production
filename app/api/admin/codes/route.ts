import { NextRequest, NextResponse } from 'next/server';
import { executeTurso, batchTurso } from '@/lib/turso';

export async function GET() {
  try {
    const result = await executeTurso(
      'SELECT code, duration_days, price_fcfa, batch_name, is_redeemed, redeemed_by_phone, created_at FROM activation_codes ORDER BY created_at DESC LIMIT 100;'
    );
    return NextResponse.json({
      success: true,
      codes: result.rows
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { count = 10, duration_days = 30, price_fcfa = 2000, batch_name = 'Lote-Malabo-Bata' } = await req.json();

    const statements = [];
    const generatedCodes = [];

    for (let i = 0; i < count; i++) {
      const id = crypto.randomUUID();
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const code = `GE-${duration_days}D-${randomSuffix}`;

      generatedCodes.push({
        id,
        code,
        duration_days,
        price_fcfa,
        batch_name,
        is_redeemed: 0
      });

      statements.push({
        sql: `INSERT INTO activation_codes (id, code, duration_days, price_fcfa, batch_name, is_redeemed)
              VALUES (?, ?, ?, ?, ?, 0);`,
        args: [id, code, duration_days, price_fcfa, batch_name]
      });
    }

    // Insertar en TURSO por lotes
    await batchTurso(statements);

    return NextResponse.json({
      success: true,
      message: `${count} tarjetas rasca creadas exitosamente en Turso Cloud`,
      codes: generatedCodes.map(c => c.code)
    });

  } catch (err: any) {
    console.error('Turso Admin Codes Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
