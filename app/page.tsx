'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AgronomoPwaApp() {
  const [activeTab, setActiveTab] = useState<'farmer' | 'admin'>('farmer');
  const [phoneNumber, setPhoneNumber] = useState('+240 222 456 789');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | string>(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  // Modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [scratchCode, setScratchCode] = useState('');

  // Admin state
  const [adminCodes, setAdminCodes] = useState<string[]>([
    'GE-30D-K89A2', 'GE-30D-M41B9', 'GE-30D-P73C5', 'BIOKO-VIP-2026'
  ]);
  const [batchCount, setBatchCount] = useState(10);

  // Registrar Service Worker al montar
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('[Agrónomo PWA] Service Worker registrado con éxito:', reg.scope);
      }).catch((err) => {
        console.error('[Agrónomo PWA] Error al registrar Service Worker:', err);
      });
    }
  }, []);

  // Manejar selección de foto
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setDiagnosticResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar imagen al motor de IA
  const handleAnalyzePlant = async () => {
    if (!imageFile) return;
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('phone_number', phoneNumber);
      formData.append('province', 'Litoral');

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setDiagnosticResult(data.data);
        setQuotaRemaining(data.quota_remaining);
      } else {
        alert(data.error || 'Error al analizar la planta');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor de IA.');
    } finally {
      setIsScanning(false);
    }
  };

  // Canjear código prepago
  const handleRedeemCode = async () => {
    if (!scratchCode) return;
    try {
      const res = await fetch('/api/subscription/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, activation_code: scratchCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSubscribed(true);
        setQuotaRemaining('Ilimitado');
        setShowRedeemModal(false);
        setScratchCode('');
        alert('🎉 ' + data.message);
      } else {
        alert(data.error || 'Código incorrecto');
      }
    } catch (err) {
      alert('Error al canjear código.');
    }
  };

  // Generar códigos prepago (Admin)
  const handleGenerateBatch = async () => {
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: batchCount, duration_days: 30, price_fcfa: 2000 }),
      });
      const data = await res.json();
      if (data.codes) {
        const newCodeStrings = data.codes.map((c: any) => c.code);
        setAdminCodes([...newCodeStrings, ...adminCodes]);
        alert(`✅ ${batchCount} Códigos generados exitosamente.`);
      }
    } catch (err) {
      alert('Error generando lote.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1A12] text-white flex flex-col items-center p-4 selection:bg-[#00732F]">
      {/* Barra de Navegación Glassmorphism */}
      <header className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex items-center justify-between shadow-2xl mb-6 sticky top-2 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00732F] to-[#2ECC71] flex items-center justify-center shadow-lg border border-white/30">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-1.5">
              Agrónomo <span className="text-xs bg-[#00732F] text-white px-2 py-0.5 rounded-full font-semibold">GE 🇬🇶</span>
            </h1>
            <p className="text-xs text-emerald-400">PWA • Visión IA Universal</p>
          </div>
        </div>

        {/* Switch Modo Agricultor / Administrador */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('farmer')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'farmer' ? 'bg-[#00732F] text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Campo
          </button>
          <a
            href="/admin"
            className="px-3 py-1.5 rounded-xl font-medium transition-all bg-[#0072CE]/80 hover:bg-[#0072CE] text-white shadow-md flex items-center gap-1"
          >
            Panel Admin 📊
          </a>
        </div>
      </header>

      {/* ============================================================== */}
      {/* VISTA 1: MODO AGRICULTOR (CAMPO)                               */}
      {/* ============================================================== */}
      {activeTab === 'farmer' && (
        <main className="w-full max-w-lg flex flex-col gap-4 pb-20">
          {/* Banner de Descarga APK Rebrandeada e Instalador Nativo */}
          <div className="bg-gradient-to-r from-emerald-900/60 to-emerald-700/40 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📲</span>
              <div>
                <p className="text-xs font-bold text-emerald-200">App Oficial Agrónomo para Android</p>
                <p className="text-[10px] text-gray-300">APK nativa firmada (gq.agronomo.app)</p>
              </div>
            </div>
            <a
              href="/Agronomo.apk"
              download="Agronomo.apk"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-1.5 rounded-xl shadow transition-all flex items-center gap-1"
            >
              📥 Descargar APK
            </a>
          </div>

          {/* Tarjeta de Estado del Usuario */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/15 rounded-3xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-sm">
                📱
              </div>
              <div>
                <p className="text-xs text-gray-400">Productor Registrado</p>
                <p className="text-sm font-semibold">{phoneNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold border ${
                isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isSubscribed ? 'VIP Ilimitado' : `${quotaRemaining} Escaneos`}
              </span>
              <button
                onClick={() => setShowRedeemModal(true)}
                className="block text-[11px] text-blue-400 font-semibold mt-1 hover:underline text-right w-full"
              >
                + Activar Tarjeta
              </button>
            </div>
          </div>

          {/* Visor de Cámara y Escaneo */}
          <div className="relative bg-black/60 backdrop-blur-2xl border-2 border-dashed border-emerald-500/40 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px] overflow-hidden group">
            {imagePreview ? (
              <div className="relative w-full flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Cultivo a analizar"
                  className="rounded-2xl max-h-64 object-cover shadow-2xl border border-white/20 w-full"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-emerald-300 animate-pulse">
                      Identificando cultivo y patógenos con IA...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">
                  📷
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-200">Enfoca la hoja o fruto enfermo</h3>
                  <p className="text-xs text-gray-400 max-w-xs mt-1">
                    Compatible con Cacao, Yuca, Plátano, Café, Palma, Hortalizas y más de 300.000 especies.
                  </p>
                </div>
              </div>
            )}

            {/* Selector de Archivo / Cámara */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Botón de Acción Principal */}
          {imagePreview && !diagnosticResult && (
            <button
              onClick={handleAnalyzePlant}
              disabled={isScanning}
              className="w-full py-4 bg-gradient-to-r from-[#00732F] via-[#229D45] to-[#2ECC71] rounded-2xl font-bold text-base shadow-xl border border-white/30 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
            >
              <span>🔬 Diagnosticar con Inteligencia Artificial</span>
            </button>
          )}

          {/* Resultado del Diagnóstico (Glassmorphism Card) */}
          {diagnosticResult && (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                    Cultivo Identificado
                  </span>
                  <h2 className="text-xl font-black text-white">{diagnosticResult.crop_detected}</h2>
                  <p className="text-xs italic text-gray-400">{diagnosticResult.scientific_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                  diagnosticResult.is_healthy
                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                    : 'bg-red-500/30 text-red-300 border-red-500'
                }`}>
                  {diagnosticResult.is_healthy ? '✓ SALUDABLE' : `ALERTA: ${diagnosticResult.severity}`}
                </span>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5">
                <p className="text-xs font-bold text-red-400 mb-1">Diagnóstico:</p>
                <p className="text-sm font-semibold text-white">{diagnosticResult.condition_detected}</p>
                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">{diagnosticResult.description}</p>
              </div>

              {/* Tratamientos */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Plan de Tratamiento Recomendado:
                </h4>

                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3 text-xs space-y-1">
                  <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                    🌱 Tratamiento Ecológico / Casero (GE):
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 pl-1">
                    {diagnosticResult.treatments?.organic?.map((t: string, idx: number) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-950/40 border border-blue-500/20 rounded-2xl p-3 text-xs space-y-1">
                  <p className="font-bold text-blue-300 flex items-center gap-1.5">
                    🧪 Tratamiento Fitosanitario:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 pl-1">
                    {diagnosticResult.treatments?.chemical?.map((t: string, idx: number) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setDiagnosticResult(null);
                }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all text-center mt-2"
              >
                ← Realizar Nuevo Escaneo
              </button>
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: PANEL ADMINISTRATIVO (NEGOCIO & GUINEA ECUATORIAL)   */}
      {/* ============================================================== */}
      {activeTab === 'admin' && (
        <section className="w-full max-w-lg flex flex-col gap-4 pb-20">
          <div className="bg-gradient-to-r from-blue-950/60 to-emerald-950/60 border border-white/20 rounded-3xl p-5 shadow-2xl">
            <h2 className="text-lg font-bold">Panel de Control General</h2>
            <p className="text-xs text-gray-300">Gestión de Usuarios, Suscripciones y Alertas Fitosanitarias GE</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                <p className="text-[11px] text-gray-400">Total Productores</p>
                <p className="text-xl font-black text-emerald-400">1.284</p>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                <p className="text-[11px] text-gray-400">Ingresos Prepago</p>
                <p className="text-xl font-black text-blue-400">2.568.000 <span className="text-xs font-normal">FCFA</span></p>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                <p className="text-[11px] text-gray-400">Escaneos Hoy</p>
                <p className="text-xl font-black text-amber-400">312</p>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
                <p className="text-[11px] text-gray-400">Foco Principal</p>
                <p className="text-sm font-bold text-red-400 truncate">Cacao (Bioko Norte)</p>
              </div>
            </div>
          </div>

          {/* Generador de Tarjetas Prepago */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/15 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold">Generador de Tarjetas Rasca (PIN)</h3>
                <p className="text-xs text-gray-400">Genera lotes para tiendas de Malabo y Bata</p>
              </div>
              <button
                onClick={handleGenerateBatch}
                className="px-3 py-1.5 bg-[#00732F] hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                + Generar Lote
              </button>
            </div>

            <div className="bg-black/50 rounded-2xl p-3 border border-white/10 max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs">
              {adminCodes.map((code, index) => (
                <div key={index} className="flex justify-between items-center text-gray-300 py-0.5 border-b border-white/5">
                  <span className="text-emerald-400">{code}</span>
                  <span className="text-[10px] text-gray-500">2.000 FCFA (30 días)</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MODAL: Canjear Tarjeta Prepago */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#122419] border border-emerald-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4">
            <h3 className="font-bold text-base text-white">Canjear Tarjeta Agrónomo GE</h3>
            <p className="text-xs text-gray-300">
              Introduce el código de 10 dígitos impreso en el reverso de tu tarjeta prepago física.
            </p>

            <input
              type="text"
              placeholder="Ej: GE-AGRO-MES-2026"
              value={scratchCode}
              onChange={(e) => setScratchCode(e.target.value.toUpperCase())}
              className="w-full bg-black/60 border border-emerald-500/50 rounded-xl p-3 text-center font-mono font-bold text-emerald-300 tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 py-2.5 bg-white/10 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleRedeemCode}
                className="flex-1 py-2.5 bg-[#00732F] rounded-xl text-xs font-bold text-white shadow-lg"
              >
                Activar Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
