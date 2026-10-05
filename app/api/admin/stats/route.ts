import { NextResponse } from 'next/server';
import { executeTurso } from '@/lib/turso';

export async function GET() {
  try {
    const [usersRes, diagRes, alertsRes, codesRes] = await Promise.all([
      executeTurso('SELECT COUNT(*) as count FROM profiles;'),
      executeTurso('SELECT COUNT(*) as count FROM plant_diagnoses;'),
      executeTurso('SELECT id, disease_name, crop, province, alert_level, description, created_at FROM outbreak_alerts ORDER BY created_at DESC LIMIT 10;'),
      executeTurso('SELECT code, duration_days, price_fcfa, batch_name, is_redeemed, redeemed_by_phone, created_at FROM activation_codes ORDER BY created_at DESC LIMIT 50;')
    ]);

    const totalUsers = usersRes.rows[0]?.count || 0;
    const totalDiagnoses = diagRes.rows[0]?.count || 0;
    const recentAlerts = alertsRes.rows || [];
    const codes = codesRes.rows || [];

    const redeemedCodes = codes.filter(c => c.is_redeemed === 1 || c.is_redeemed === '1').length;
    const availableCodes = codes.length - redeemedCodes;

    return NextResponse.json({
      success: true,
      stats: {
        total_farmers: totalUsers,
        total_diagnoses: totalDiagnoses,
        active_alerts: recentAlerts.length,
        available_vouchers: availableCodes,
        redeemed_vouchers: redeemedCodes
      },
      recent_alerts: recentAlerts,
      recent_codes: codes
    });
  } catch (err: any) {
    console.error('Admin Stats Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
