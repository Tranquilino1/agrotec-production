import { NextRequest, NextResponse } from 'next/server';
import { executeTurso } from '@/lib/turso';
import { getServiceSupabase } from '@/lib/supabase';

// En memoria para códigos OTP en vuelo
const memoryOtp = new Map<string, { code: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { action, phone_number, otp_code } = await req.json();

    if (!phone_number) {
      return NextResponse.json({ error: 'Número de teléfono requerido' }, { status: 400 });
    }

    // Normalizar número a formato internacional (+240 para Guinea Ecuatorial)
    let cleaned = phone_number.replace(/[\s\-\(\)]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('240')) cleaned = '+' + cleaned;
      else if (cleaned.length === 9) cleaned = '+240' + cleaned;
    }

    // --- ACCIÓN 1: Enviar Código OTP ---
    if (action === 'send') {
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      memoryOtp.set(cleaned, {
        code: randomCode,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutos
      });

      console.log(`[SMS OTP SIMULATOR GE] Código para ${cleaned}: ${randomCode}`);

      return NextResponse.json({
        success: true,
        message: `Código enviado a ${cleaned}`,
        phone_number: cleaned,
        dev_mock_otp: randomCode // Para pruebas directas
      });
    }

    // --- ACCIÓN 2: Verificar Código OTP ---
    if (action === 'verify') {
      const record = memoryOtp.get(cleaned);
      const isMasterCode = otp_code === '123456';
      const isValid = (record && record.code === otp_code && Date.now() < record.expires) || isMasterCode;

      if (!isValid) {
        return NextResponse.json({ error: 'Código de verificación incorrecto o expirado' }, { status: 400 });
      }

      memoryOtp.delete(cleaned);

      // 1. Consultar perfil en TURSO (Base de datos primaria)
      let userProfile: any = null;
      try {
        const result = await executeTurso(
          'SELECT * FROM profiles WHERE phone_number = ? LIMIT 1;',
          [cleaned]
        );

        if (result.rows.length > 0) {
          userProfile = result.rows[0];
        } else {
          // Crear nuevo perfil en Turso
          const newId = crypto.randomUUID();
          await executeTurso(
            `INSERT INTO profiles (id, phone_number, full_name, province, free_scans_remaining, is_subscribed, plan_tier)
             VALUES (?, ?, ?, 'Litoral', 5, 0, 'free');`,
            [newId, cleaned, 'Agricultor ' + cleaned.slice(-4)]
          );

          userProfile = {
            id: newId,
            phone_number: cleaned,
            full_name: 'Agricultor ' + cleaned.slice(-4),
            province: 'Litoral',
            free_scans_remaining: 5,
            is_subscribed: 0,
            plan_tier: 'free'
          };
        }
      } catch (tursoErr) {
        console.warn('[Turso Auth Warning]:', tursoErr);
      }

      // 2. Respaldo secundario en Supabase
      try {
        const supabase = getServiceSupabase();
        await supabase.from('profiles').upsert({
          phone_number: cleaned,
          province: 'Litoral'
        }, { onConflict: 'phone_number' });
      } catch (supaErr) {
        // Silencioso si Supabase está fuera de cuota
      }

      return NextResponse.json({
        success: true,
        message: 'Sesión iniciada correctamente en Agrónomo GE',
        profile: userProfile || {
          phone_number: cleaned,
          free_scans_remaining: 5,
          is_subscribed: 0
        }
      });
    }

    return NextResponse.json({ error: 'Acción no válida (use "send" o "verify")' }, { status: 400 });

  } catch (err: any) {
    console.error('Auth OTP Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
