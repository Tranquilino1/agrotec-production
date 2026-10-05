'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [batchDays, setBatchDays] = useState(30);
  const [batchPrice, setBatchPrice] = useState(2000);
  const [batchName, setBatchName] = useState('Lote-Malabo-Bata-2026');
  const [generationMsg, setGenerationMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenerationMsg('');
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: Number(batchCount),
          duration_days: Number(batchDays),
          price_fcfa: Number(batchPrice),
          batch_name: batchName
        })
      });
      const data = await res.json();
      if (data.success) {
        setGenerationMsg(`✅ ¡${data.message}! Nuevos códigos creados.`);
        loadData();
      } else {
        setGenerationMsg(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setGenerationMsg(`❌ Error de conexión: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl">
              🇬🇶
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Agrónomo GE — Panel Administrativo
            </h1>
            <p className="text-xs text-slate-400">Control de Usuarios, Diagnósticos Fitosanitarios y Tarjetas Prepago</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="https://app.turso.tech/aidasolution/databases/agronomo-db/data"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium transition"
          >
            🚀 Turso Cloud (9 GB)
          </a>
          <a
            href="https://supabase.com/dashboard/project/epifjpbwbnphlhhfhigm"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition"
          >
            🛡️ Supabase Backup
          </a>
          <a
            href="https://vercel.com/thetrapkinzofafrica-4878s-projects/agrotec-production"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 text-xs font-medium transition"
          >
            ▲ Vercel Hosting
          </a>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            📱 Ir a la App Móvil
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 space-y-8">
        {/* Metric KPI Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase text-emerald-400">Agricultores</span>
            <div className="text-3xl font-bold mt-2">{loading ? '...' : stats?.stats?.total_farmers ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Registrados con prefijo +240</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase text-sky-400">Diagnósticos IA</span>
            <div className="text-3xl font-bold mt-2">{loading ? '...' : stats?.stats?.total_diagnoses ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Gemini 3.8 Flash Vision</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase text-amber-400">Alertas Activas</span>
            <div className="text-3xl font-bold mt-2">{loading ? '...' : stats?.stats?.active_alerts ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Brotes epidemiológicos provinciales</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase text-teal-400">Tarjetas Rasca</span>
            <div className="text-3xl font-bold mt-2">{loading ? '...' : stats?.stats?.available_vouchers ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Disponibles / {stats?.stats?.redeemed_vouchers ?? 0} canjeadas</p>
          </div>
        </section>

        {/* Generator & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lote Code Generator Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
            <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
              🎫 Emitir Tarjetas Prepago en FCFA
            </h2>
            <p className="text-xs text-slate-400">
              Genera paquetes de tarjetas rasca para vender en quioscos, mercados y cooperativas de Guinea Ecuatorial.
            </p>

            <form onSubmit={handleGenerateCodes} className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Cantidad de Códigos</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Duración (Días)</label>
                  <select
                    value={batchDays}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setBatchDays(d);
                      if (d === 30) setBatchPrice(2000);
                      else if (d === 90) setBatchPrice(5000);
                      else if (d === 180) setBatchPrice(10000);
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={30}>30 Días (1 Mes)</option>
                    <option value={90}>90 Días (3 Meses)</option>
                    <option value={180}>180 Días (6 Meses)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Precio (FCFA)</label>
                  <input
                    type="number"
                    value={batchPrice}
                    onChange={(e) => setBatchPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Nombre del Lote / Destino</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Ej: Lote-Mercado-Bata"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {generating ? 'Generando en Turso...' : '⚡ Generar Lote de Tarjetas'}
              </button>

              {generationMsg && (
                <p className="text-xs p-2 rounded-lg bg-white/5 border border-white/10 text-center font-medium">
                  {generationMsg}
                </p>
              )}
            </form>
          </div>

          {/* Epidemiological Outbreak Alerts Table */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                🚨 Monitor de Brotes Fitosanitarios
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Alerta Temprana GE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enfermedades de severidad alta detectadas por la IA en fincas de Guinea Ecuatorial.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-2">Enfermedad / Plaga</th>
                    <th className="pb-2">Cultivo</th>
                    <th className="pb-2">Provincia</th>
                    <th className="pb-2">Nivel</th>
                    <th className="pb-2">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats?.recent_alerts?.length > 0 ? (
                    stats.recent_alerts.map((alert: any) => (
                      <tr key={alert.id} className="hover:bg-white/5">
                        <td className="py-2.5 font-medium text-white">{alert.disease_name}</td>
                        <td className="py-2.5 text-slate-300">{alert.crop}</td>
                        <td className="py-2.5 text-slate-300">{alert.province}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              alert.alert_level === 'Rojo'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            }`}
                          >
                            {alert.alert_level}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">{alert.created_at?.substring(0, 10) || 'Hoy'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">
                        No hay brotes severos registrados actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Voucher List Section */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-sky-300 flex items-center gap-2">
              📋 Registro de Tarjetas Rasca Prepago en Turso
            </h2>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition"
            >
              🔄 Actualizar Lista
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-2">Código PIN</th>
                  <th className="pb-2">Duración</th>
                  <th className="pb-2">Precio</th>
                  <th className="pb-2">Lote</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Canjeado Por</th>
                  <th className="pb-2">Emisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {stats?.recent_codes?.map((code: any) => (
                  <tr key={code.code} className="hover:bg-white/5">
                    <td className="py-2.5 font-bold text-emerald-400">{code.code}</td>
                    <td className="py-2.5 text-slate-300">{code.duration_days} días</td>
                    <td className="py-2.5 text-slate-300">{code.price_fcfa.toLocaleString()} FCFA</td>
                    <td className="py-2.5 text-slate-400 font-sans">{code.batch_name}</td>
                    <td className="py-2.5 font-sans">
                      {code.is_redeemed === 1 || code.is_redeemed === '1' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          Canjeado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-300">{code.redeemed_by_phone || '—'}</td>
                    <td className="py-2.5 text-slate-500 font-sans">{code.created_at?.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
