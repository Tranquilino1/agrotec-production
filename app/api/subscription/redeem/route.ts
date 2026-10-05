import { NextRequest, NextResponse } from 'next/server';
import { executeTurso } from '@/lib/turso';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { phone_number, activation_code } = await req.json();

    if (!phone_number || !activation_code) {
      return NextResponse.json({ error: 'Número de teléfono y código requeridos' }, { status: 400 });
    }

    const cleanPhone = phone_number.trim();
    const cleanCode = activation_code.trim().toUpperCase();

    // 1. Validar código en TURSO (Base de datos primaria de 9 GB)
    const codeResult = await executeTurso(
      'SELECT * FROM activation_codes WHERE code = ? LIMIT 1;',
      [cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El código introducido no existe en el registro oficial de Guinea Ecuatorial.'
      }, { status: 400 });
    }

    const codeRecord = codeResult.rows[0];

    if (codeRecord.is_redeemed === 1) {
      return NextResponse.json({
        success: false,
        error: `Este código ya fue canjeado el ${codeRecord.redeemed_at || 'anteriormente'}.`
      }, { status: 400 });
    }

    const durationDays = codeRecord.duration_days || 30;

    // 2. Marcar código como canjeado en Turso
    await executeTurso(
      'UPDATE activation_codes SET is_redeemed = 1, redeemed_by_phone = ?, redeemed_at = CURRENT_TIMESTAMP WHERE code = ?;',
      [cleanPhone, cleanCode]
    );

    // 3. Actualizar o crear perfil de usuario en Turso
    const userResult = await executeTurso(
      'SELECT * FROM profiles WHERE phone_number = ? LIMIT 1;',
      [cleanPhone]
    );

    if (userResult.rows.length > 0) {
      await executeTurso(
        `UPDATE profiles 
         SET is_subscribed = 1, 
             plan_tier = 'premium', 
             subscription_expires_at = datetime('now', '+' || ? || ' days'),
             updated_at = CURRENT_TIMESTAMP
         WHERE phone_number = ?;`,
        [durationDays, cleanPhone]
      );
    } else {
      const newUserId = crypto.randomUUID();
      await executeTurso(
        `INSERT INTO profiles (id, phone_number, full_name, province, is_subscribed, plan_tier, subscription_expires_at)
         VALUES (?, ?, ?, 'Litoral', 1, 'premium', datetime('now', '+' || ? || ' days'));`,
        [newUserId, cleanPhone, 'Productor Agrícola', durationDays]
      );
    }

    // 4. Sincronización secundaria en Supabase (Respaldo no bloqueante)
    try {
      const supabase = getServiceSupabase();
      await supabase.from('activation_codes').update({
        is_redeemed: true,
        redeemed_by_phone: cleanPhone,
        redeemed_at: new Date().toISOString()
      }).eq('code', cleanCode);
    } catch (e) {
      // Ignorar fallas secundarias de Supabase
    }

    return NextResponse.json({
      success: true,
      message: `¡Código "${cleanCode}" canjeado con éxito! Suscripción Premium activada por ${durationDays} días.`,
      duration_days: durationDays,
      plan: 'Agrónomo Premium Guinea Ecuatorial'
    });

  } catch (err: any) {
    console.error('Turso Redeem Error:', err);
    return NextResponse.json({ error: err.message || 'Error procesando el canje' }, { status: 500 });
  }
}
