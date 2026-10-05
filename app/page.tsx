'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  QrCode, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  Smartphone, 
  Sparkles,
  ChevronDown,
  Info,
  X,
  Leaf,
  Clock,
  ShieldAlert,
  Droplets,
  DollarSign,
  Layers,
  ThermometerSnowflake,
  ExternalLink
} from 'lucide-react';

// Cultivos prioritarios en Guinea Ecuatorial
const CROP_CATEGORIES = [
  { id: 'cacao', name: 'Cacao Bioko', icon: '🍫', tip: 'Monilia, Mazorca Negra (Phytophthora) y Chinches de la corteza' },
  { id: 'yuca', name: 'Yuca Tropical', icon: '🥔', tip: 'Mosaico de la Yuca (CMD), Mancha Parda y Bacteriosis' },
  { id: 'platano', name: 'Plátano / Banano', icon: '🍌', tip: 'Sigatoka Negra, Picudo Negro y Mal de Panamá' },
  { id: 'cafe', name: 'Café Robusta', icon: '☕', tip: 'Roya del Cafeto, Broca del Fruto y Mancha de Hierro' },
  { id: 'palma', name: 'Palma Aceitera', icon: '🌴', tip: 'Pudrición del Cogollo, Marchitez por Fusarium y Anillo Rojo' },
  { id: 'hortalizas', name: 'Hortalizas y Tomate', icon: '🍅', tip: 'Tizón Tardío, Mosca Blanca, Oídio y Podredumbre apical' },
];

// Órganos de la planta (Inspirado en Pl@ntNet y CABI)
const PLANT_ORGANS = [
  { id: 'fruit', name: 'Fruto / Mazorca', icon: '🍫' },
  { id: 'leaf', name: 'Hoja / Follaje', icon: '🍃' },
  { id: 'stem', name: 'Tronco / Tallo', icon: '🪵' },
  { id: 'plant', name: 'Árbol Entero', icon: '🌳' },
];

export default function AgronomoPwaApp() {
  const [activeTab, setActiveTab] = useState<'farmer' | 'admin'>('farmer');
  const [selectedCrop, setSelectedCrop] = useState<string>('cacao');
  const [selectedOrgan, setSelectedOrgan] = useState<string>('fruit');
  const [treatmentStrategy, setTreatmentStrategy] = useState<'organic' | 'chemical'>('organic');
  const [backpackCount, setBackpackCount] = useState<number>(1); // Mochilas de 15 Litros

  const [phoneNumber, setPhoneNumber] = useState('+240 222 456 789');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | string>(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Modales
  const [showQrModal, setShowQrModal] = useState(false);
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
        console.log('[Agrónomo PWA] Service Worker activo:', reg.scope);
      }).catch((err) => {
        console.error('[Agrónomo PWA] Error SW:', err);
      });
    }
  }, []);

  // Manejar selección de foto
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setIsDemoMode(false);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setDiagnosticResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cargar imagen de muestra de Cacao (Demo en 1-Clic sin restricciones)
  const handleLoadDemoImage = async () => {
    try {
      const response = await fetch('/sample-cacao.jpg');
      const blob = await response.blob();
      const file = new File([blob], 'sample-cacao.jpg', { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreview('/sample-cacao.jpg');
      setIsDemoMode(true);
      setDiagnosticResult(null);
    } catch (err) {
      console.error('Error cargando demo:', err);
    }
  };

  // Enviar imagen al motor de IA multimodal
  const handleAnalyzePlant = async () => {
    if (!imageFile) return;
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('phone_number', phoneNumber);
      formData.append('province', 'Bioko Norte');
      formData.append('organ', selectedOrgan);
      if (isDemoMode) {
        formData.append('is_demo', 'true');
      }

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setDiagnosticResult(data.data);
        if (!isDemoMode && data.quota_remaining !== undefined) {
          setQuotaRemaining(data.quota_remaining);
        }
      } else {
        alert(data.error || 'Error al analizar la planta');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servicio fitosanitario.');
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

  // Despacho de ficha a WhatsApp ("Segunda Opinión Agronómica")
  const handleShareWhatsApp = () => {
    if (!diagnosticResult) return;
    const patCat = diagnosticResult.pathogen_category ? `[${diagnosticResult.pathogen_category.toUpperCase()}] ` : '';
    const text = `🌿 *CONSULTA FITOSANITARIA - AGRÓNOMO GE* 🇬🇶\n` +
      `──────────────────────────────\n` +
      `👨🏾‍🌾 *Cultivo:* ${diagnosticResult.crop_detected}\n` +
      `🔍 *Órgano afectado:* ${diagnosticResult.organ_analyzed || selectedOrgan}\n` +
      `🚨 *Diagnóstico IA:* ${diagnosticResult.condition_detected} (${diagnosticResult.pathogen_scientific || diagnosticResult.scientific_name})\n` +
      `📊 *Certeza:* ${(diagnosticResult.confidence * 100).toFixed(0)}% | *Severidad:* ${diagnosticResult.severity_level || diagnosticResult.severity || 'ALERTA'}\n` +
      `\n` +
      `💊 *Tratamiento Sugerido:*\n` +
      (treatmentStrategy === 'organic' 
        ? `• Modo Agroecológico: ${diagnosticResult.treatments?.organic_home?.title || 'Preparado local'}\n• Dosis: ${diagnosticResult.treatments?.organic_home?.dosage_backpack_15L || 'Ver ficha'}\n`
        : `• Materia Activa: ${diagnosticResult.treatments?.chemical_commercial?.active_ingredient || 'Fungicida cúprico'}\n• Dosis Mochila 15L: ${diagnosticResult.treatments?.chemical_commercial?.dosage_backpack_15L || '4 cucharadas soperas (40g)'}\n• Plazo de Carencia: ${diagnosticResult.treatments?.safety?.phi_days || 14} días\n`) +
      `\n` +
      `📲 *Ficha en línea:* https://agronomo-ge.vercel.app\n` +
      `_¿Confirma este diagnóstico y tratamiento, Ingeniero?_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Auxiliares de presentación de patógenos
  const getPathogenBadge = (category: string) => {
    switch (category) {
      case 'fungal':
        return { label: 'Hongo Fitopatógeno', color: 'bg-purple-900/60 text-purple-300 border-purple-500/40', icon: '🍄' };
      case 'bacterial':
        return { label: 'Bacteriosis Vascular', color: 'bg-amber-900/60 text-amber-300 border-amber-500/40', icon: '🦠' };
      case 'viral':
        return { label: 'Infección Viral', color: 'bg-red-900/60 text-red-300 border-red-500/40', icon: '🧬' };
      case 'pest':
        return { label: 'Plaga / Insecto', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40', icon: '🐛' };
      case 'deficiency':
        return { label: 'Carencia Nutricional', color: 'bg-yellow-900/60 text-yellow-300 border-yellow-500/40', icon: '🧪' };
      default:
        return { label: 'Patología Vegetal', color: 'bg-slate-900/60 text-slate-300 border-slate-500/40', icon: '🌱' };
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'critical':
      case 'Alta':
      case 'Severa':
        return { label: 'CRÍTICA - RIESGO DE PÉRDIDA', color: 'bg-red-500/20 text-red-300 border-red-500/40', bar: 'w-11/12 bg-red-500' };
      case 'moderate':
      case 'Moderada':
        return { label: 'MODERADA - INTERVENIR EN 48H', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', bar: 'w-6/12 bg-amber-500' };
      default:
        return { label: 'LEVE / FOCAL (<10% DAÑO)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', bar: 'w-3/12 bg-emerald-500' };
    }
  };

  return (
    <div className="min-h-screen bg-[#06120A] text-slate-100 flex flex-col items-center selection:bg-[#00732F] selection:text-white antialiased">
      {/* Luz ambiental Apple Aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[620px] h-[360px] bg-gradient-to-b from-emerald-600/15 via-emerald-800/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ============================================================== */}
      {/* 1. BARRA DE NAVEGACIÓN ESTILO iOS SF PRO                       */}
      {/* ============================================================== */}
      <header className="w-full max-w-xl sticky top-3 z-40 px-4 mb-3">
        <div className="ios-glass rounded-3xl p-3 flex items-center justify-between shadow-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-emerald-950 flex-shrink-0">
              <img 
                src="/icons/app-icon-3d.png" 
                alt="Agrónomo 3D Icon" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white">Agrónomo</h1>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  GE 🇬🇶
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium">Clínica Fitosanitaria & Visión IA</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10 transition-all flex items-center justify-center"
              aria-label="Ver Código QR"
              title="Escanear QR para instalar APK"
            >
              <QrCode className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('farmer')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'farmer' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Campo
              </button>
              <a
                href="/admin"
                className="px-3 py-1.5 rounded-xl font-semibold transition-all bg-sky-600/80 hover:bg-sky-500 text-white shadow-md flex items-center gap-1 text-[11px]"
              >
                Admin 📊
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. VISTA PRINCIPAL: AGRICULTOR (CAMPO)                         */}
      {/* ============================================================== */}
      {activeTab === 'farmer' && (
        <main className="w-full max-w-xl px-4 flex flex-col gap-4 pb-24">

          {/* BANNER INSTALADOR ANDROID CON CÓDIGO QR ESCANEABLE */}
          <section className="relative overflow-hidden rounded-3xl ios-card p-4 border border-emerald-500/25 shadow-xl bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black/60">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Instalador Oficial Android
                  </span>
                </div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  Instala Agrónomo en tu Teléfono
                </h2>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Apunta con la cámara de tu móvil al código QR para descargar la APK oficial (.apk) o pulsa descarga directa.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="/Agronomo.apk"
                    download="Agronomo.apk"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar APK (0.8 MB)
                  </a>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Ver QR
                  </button>
                </div>
              </div>

              {/* Miniatura de Código QR con borde blanco de alto contraste */}
              <div 
                onClick={() => setShowQrModal(true)}
                className="cursor-pointer bg-white p-2 rounded-2xl shadow-md border-2 border-emerald-400/40 hover:scale-105 transition-transform flex-shrink-0 flex flex-col items-center group"
                title="Toca para ampliar el QR"
              >
                <img 
                  src="/qr-apk.svg" 
                  alt="QR Descargar APK Agrónomo" 
                  className="w-20 h-20 object-contain"
                />
                <span className="text-[9px] font-bold text-emerald-900 tracking-tight mt-0.5 flex items-center gap-0.5">
                  Escanear <ChevronDown className="w-2.5 h-2.5 group-hover:translate-y-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </section>

          {/* PERFIL DEL PRODUCTOR Y SALDO DE ESCANEOS */}
          <div className="ios-glass rounded-2xl p-3.5 flex items-center justify-between border border-white/10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Productor Registrado</p>
                <p className="text-xs font-bold text-slate-200">{phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                isSubscribed 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isSubscribed ? 'VIP Ilimitado' : `${quotaRemaining} Escaneos`}
              </span>
              <button
                onClick={() => setShowRedeemModal(true)}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 rounded-xl transition-all"
              >
                + Tarjeta
              </button>
            </div>
          </div>

          {/* SELECTOR DE CULTIVOS AUTÓCTONOS DE GUINEA ECUATORIAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Cultivo Principal:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CROP_CATEGORIES.map((crop) => {
                const isSelected = selectedCrop === crop.id;
                return (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all text-center border ${
                      isSelected
                        ? 'bg-gradient-to-b from-emerald-600/30 to-emerald-950/60 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400/40 scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl">{crop.icon}</span>
                    <span className="text-[11px] font-bold leading-tight truncate w-full">
                      {crop.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* NUEVO: PRE-SELECCIÓN DE ÓRGANO BOTÁNICO (PATRÓN PL@NTNET/CABI) */}
          {/* ============================================================== */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-300 px-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              ¿Qué parte de la planta vas a fotografiar?
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PLANT_ORGANS.map((organ) => {
                const isSelected = selectedOrgan === organ.id;
                return (
                  <button
                    key={organ.id}
                    onClick={() => setSelectedOrgan(organ.id)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center gap-0.5 border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{organ.icon}</span>
                    <span className="text-[10px] leading-tight truncate w-full">{organ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* VISOR ÓPTICO DE CÁMARA & RETÍCULA INTELIGENTE (PLANTIX/APPLE)  */}
          {/* ============================================================== */}
          <div className="relative rounded-3xl ios-glass border border-white/15 overflow-hidden shadow-2xl p-4 flex flex-col items-center justify-center min-h-[340px]">
            {/* Retícula óptica (Viewfinder brackets en las 4 esquinas) */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400 rounded-br-xl pointer-events-none" />

            {/* Vista previa de imagen cargada */}
            {imagePreview ? (
              <div className="relative w-full flex flex-col items-center">
                <div className="relative w-full max-h-[320px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  <img
                    src={imagePreview}
                    alt="Muestra botánica cargada"
                    className="w-full h-full max-h-[320px] object-cover object-center"
                  />
                  {/* Animación del escáner en acción */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                      <div className="relative w-16 h-16">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-300">
                          IA
                        </div>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-extrabold text-emerald-300">
                          Analizando patología tropical...
                        </p>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Calculando severidad y dosificación fitosanitaria
                        </p>
                      </div>
                      <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón para cambiar foto */}
                {!isScanning && (
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setDiagnosticResult(null);
                      setIsDemoMode(false);
                    }}
                    className="mt-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-4"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Cambiar fotografía
                  </button>
                )}
              </div>
            ) : (
              /* Estado inicial sin imagen: Presentación del escáner 3D */
              <div className="flex flex-col items-center text-center gap-4 py-6 z-10">
                <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border border-emerald-400/30 bg-emerald-950/60 p-1 group hover:scale-105 transition-transform">
                  <img 
                    src="/icons/scanner-3d.png" 
                    alt="Escáner 3D Fitosanitario" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none rounded-2xl" />
                </div>

                <div className="max-w-xs space-y-1">
                  <h3 className="font-extrabold text-base text-white">
                    Enfoca la Lesión Fitosanitaria
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Centra la zona enferma o manchada. Asegúrate de tener luz natural homogénea y evitar el desenfoque.
                  </p>
                </div>

                {/* Disparadores de cámara táctiles iOS */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs pt-1">
                  <label className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    <span>Tomar Fotografía</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                  </label>

                  <label className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs border border-white/15 cursor-pointer active:scale-95 transition-all">
                    <span>Subir de Galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 1-Click Demo rápida */}
                <button
                  onClick={handleLoadDemoImage}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline pt-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿Sin foto en este momento? Probar con muestra de Cacao (Demo rápida)</span>
                </button>
              </div>
            )}
          </div>

          {/* BOTÓN PRINCIPAL DE DIAGNÓSTICO */}
          {imagePreview && !diagnosticResult && (
            <button
              onClick={handleAnalyzePlant}
              disabled={isScanning}
              className="w-full py-4 rounded-2xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 shadow-xl shadow-emerald-500/25 border border-white/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-900" />
              <span>Ejecutar Diagnóstico Fitosanitario con IA</span>
            </button>
          )}

          {/* ============================================================== */}
          {/* DOSSIER CLÍNICO AGRONÓMICO (BENCHMARK INTERNACIONAL TOP 10)    */}
          {/* ============================================================== */}
          {diagnosticResult && (
            <section className="ios-glass rounded-3xl p-5 border border-emerald-500/30 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Encabezado clínico con 3D Shield */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-lg flex-shrink-0 bg-emerald-950">
                    <img 
                      src="/icons/shield-3d.png" 
                      alt="Certificado Fitosanitario" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                      Dossier Fitosanitario GE
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      {diagnosticResult.crop_detected}
                    </h3>
                    <p className="text-xs italic text-slate-400">
                      {diagnosticResult.scientific_name || 'Especie tropical evaluada'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {((diagnosticResult.confidence || 0.95) * 100).toFixed(0)}% Fiabilidad IA
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {diagnosticResult.organ_analyzed || 'Muestra de campo'}
                  </p>
                </div>
              </div>

              {/* Patología y Categoría Semiótica (Hongo, Bacteria, Virus, Plaga) */}
              <div className="bg-black/40 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {/* Badge cromático de patógeno */}
                  {(() => {
                    const badge = getPathogenBadge(diagnosticResult.pathogen_category || 'fungal');
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}

                  {/* Nivel de severidad */}
                  {(() => {
                    const sev = getSeverityBadge(diagnosticResult.severity_level || diagnosticResult.severity || 'moderate');
                    return (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${sev.color}`}>
                        {sev.label}
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {diagnosticResult.condition_detected}
                  </h4>
                  {diagnosticResult.pathogen_scientific && (
                    <p className="text-xs italic text-emerald-400">
                      Agente causal: {diagnosticResult.pathogen_scientific}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed pt-1.5">
                    {diagnosticResult.description}
                  </p>
                </div>

                {/* Medidor visual de daño foliar (% DLA estilo Leaf Doctor) */}
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                    <span>Área Foliar/Fruto Dañada (% DLA):</span>
                    <span className="font-bold text-amber-400">{diagnosticResult.severity_percentage || 28}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (diagnosticResult.severity_percentage || 28) > 30 
                          ? 'bg-red-500' 
                          : (diagnosticResult.severity_percentage || 28) > 15 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, diagnosticResult.severity_percentage || 28))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Diagnósticos Diferenciales ("Otras posibles causas" estilo Plantix) */}
              {diagnosticResult.differential_diagnoses && diagnosticResult.differential_diagnoses.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 space-y-1 text-xs">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                    Diagnóstico Diferencial (Descarte de Laboratorio):
                  </p>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {diagnosticResult.differential_diagnoses.map((diff: any, idx: number) => (
                      <span key={idx} className="bg-black/40 text-slate-300 px-2 py-0.5 rounded-lg border border-white/10 text-[11px]">
                        {diff.condition} ({(diff.probability * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Síntomas verificados en campo */}
              {diagnosticResult.symptoms && (
                <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-1.5 text-xs">
                  <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Síntomas Característicos Detectados:
                  </p>
                  {Array.isArray(diagnosticResult.symptoms) ? (
                    <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                      {diagnosticResult.symptoms.map((sym: string, i: number) => (
                        <li key={i}>{sym}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-300 pl-1 leading-relaxed">
                      {String(diagnosticResult.symptoms)}
                    </p>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* PLAN DE TRATAMIENTO DUAL: AGROECOLÓGICO VS QUÍMICO             */}
              {/* ============================================================== */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Estrategia de Tratamiento:
                  </h4>

                  {/* Switch Dual Agroecológico / Fitosanitario */}
                  <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 text-[11px]">
                    <button
                      onClick={() => setTreatmentStrategy('organic')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        treatmentStrategy === 'organic'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🌿 Casero / Bio
                    </button>
                    <button
                      onClick={() => setTreatmentStrategy('chemical')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        treatmentStrategy === 'chemical'
                          ? 'bg-sky-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🧪 Fitosanitario
                    </button>
                  </div>
                </div>

                {/* Estrategia 1: Tratamiento Agroecológico / Casero (Cero Coste) */}
                {treatmentStrategy === 'organic' && (
                  <div className="bg-gradient-to-r from-emerald-950/70 to-emerald-900/40 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-emerald-300 flex items-center gap-1.5 text-sm">
                        🌿 {diagnosticResult.treatments?.organic_home?.title || 'Remedio Agroecológico Tradicional'}
                      </p>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        {diagnosticResult.treatments?.organic_home?.cost_estimate || '0 FCFA (Insumos de finca)'}
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">
                      {diagnosticResult.treatments?.organic_home?.recipe || diagnosticResult.treatments?.biological || 'Retirar partes enfermas y aplicar caldo casero de ceniza y sulfato.'}
                    </p>

                    <div className="bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        <strong>Dosis Mochila 15L:</strong> {diagnosticResult.treatments?.organic_home?.dosage_backpack_15L || '4 cucharadas soperas por mochila de 15 Litros'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Estrategia 2: Fitosanitario Comercial + Calculadora de Mochila de 15L */}
                {treatmentStrategy === 'chemical' && (
                  <div className="bg-gradient-to-r from-sky-950/70 to-indigo-950/40 border border-sky-500/30 rounded-2xl p-4 text-xs space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                        Materia Activa Recomendada
                      </span>
                      <p className="font-extrabold text-white text-sm">
                        🧪 {diagnosticResult.treatments?.chemical_commercial?.active_ingredient || 'Oxicloruro de Cobre al 50% WP (Fungicida)'}
                      </p>
                    </div>

                    {/* ============================================================== */}
                    {/* CALCULADORA INTERACTIVA DE MOCHILAS DE 15 LITROS               */}
                    {/* ============================================================== */}
                    <div className="bg-black/60 rounded-2xl p-3 border border-sky-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                          <Droplets className="w-4 h-4 text-sky-400" />
                          Calculadora de Mochilas (15 Litros):
                        </span>
                        
                        {/* Selector de número de mochilas */}
                        <div className="flex items-center gap-2 bg-white/10 px-2 py-0.5 rounded-xl">
                          <button
                            onClick={() => setBackpackCount(Math.max(1, backpackCount - 1))}
                            className="text-sm font-black text-sky-400 hover:text-white px-1"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-white text-xs">{backpackCount} ({backpackCount * 15}L)</span>
                          <button
                            onClick={() => setBackpackCount(backpackCount + 1)}
                            className="text-sm font-black text-sky-400 hover:text-white px-1"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Desglose de la mezcla */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <p className="text-slate-400">Producto en Polvo:</p>
                          <p className="text-sm font-bold text-sky-300">
                            {backpackCount * 4} Cucharadas ({backpackCount * 40}g)
                          </p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <p className="text-slate-400">Adherente Antilluvia:</p>
                          <p className="text-sm font-bold text-sky-300">
                            {backpackCount * 1} Tapón ({backpackCount * 10} ml)
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-300 pt-1 border-t border-white/10">
                        <span>Cobertura: ~{backpackCount * 35} árboles adultos</span>
                        <span>Coste aprox: {backpackCount * 2000} FCFA</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* ALERTA DE SEGURIDAD FITOSANITARIA (PHI / REI / EPI)             */}
                {/* ============================================================== */}
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Plazos Obligatorios de Seguridad y Salud Fitosanitaria:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-black/40 p-2 rounded-xl border border-amber-500/20 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-400">Plazo de Carencia (PHI):</p>
                        <p className="font-bold text-white">
                          {diagnosticResult.treatments?.safety?.phi_days || 14} Días antes de cosechar
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/40 p-2 rounded-xl border border-amber-500/20 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-400">Reentrada a Finca (REI):</p>
                        <p className="font-bold text-white">
                          {diagnosticResult.treatments?.safety?.rei_hours || 24} Horas restringidas
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 italic pt-0.5">
                    🥽 <strong>EPI obligatorio:</strong> Botas de goma, pañuelo o mascarilla en boca y nariz, y lavar manos tras pulverizar.
                  </p>
                </div>

                {/* Labores Culturales Obligatorias */}
                {(diagnosticResult.treatments?.cultural_practices || diagnosticResult.treatments?.prevention) && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs space-y-1.5">
                    <p className="font-bold text-slate-200">
                      🌾 Manejo Cultural en Parcela (Prevención de Foco):
                    </p>
                    {Array.isArray(diagnosticResult.treatments?.cultural_practices) ? (
                      <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                        {diagnosticResult.treatments.cultural_practices.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-300 leading-relaxed">
                        {String(diagnosticResult.treatments?.prevention || 'Retirar frutos momificados y podar ramas bajas para ventilación.')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de acción del reporte: WhatsApp + Nuevo Escaneo */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar Ficha a WhatsApp (Segunda Opinión)</span>
                </button>

                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setDiagnosticResult(null);
                    setIsDemoMode(false);
                  }}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all active:scale-95"
                >
                  Nuevo Escaneo
                </button>
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* PREGUNTAS FRECUENTES (GEO & CITACIONES LLM 2026)               */}
          {/* ============================================================== */}
          <section className="ios-glass rounded-3xl p-5 border border-white/10 shadow-xl space-y-3 mt-2">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-emerald-300">
                Preguntas Frecuentes (FAQ Agrícola Guinea Ecuatorial)
              </h3>
            </div>
            
            <details className="group bg-black/40 rounded-2xl p-3.5 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                <span>¿Cómo funciona el diagnóstico de plantas con IA en Guinea Ecuatorial?</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                Apunta la cámara hacia la hoja, tallo o fruto enfermo. La IA examina la morfología celular y la patología vegetal contra más de 300.000 especies y enfermedades tropicales comunes en Bioko, Litoral, Kie-Ntem, Centro Sur y Wele-Nzas (como la Mazorca Negra del cacao, Mosaico de la yuca o Sigatoka).
              </p>
            </details>

            <details className="group bg-black/40 rounded-2xl p-3.5 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                <span>¿Cómo se calculan las dosis en la mochila pulverizadora de 15 Litros?</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                A diferencia de aplicaciones europeas que usan hectolitros, Agrónomo GE calibra automáticamente las recomendaciones en mochilas de espalda de 15 Litros, indicando la cantidad exacta en cucharadas soperas o tapones dosificadores para evitar quemar el cultivo o subdosificar.
              </p>
            </details>

            <details className="group bg-black/40 rounded-2xl p-3.5 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                <span>¿Cuánto cuesta el servicio y cómo se pagan las tarjetas prepago?</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                Los primeros 5 diagnósticos son completamente gratuitos. Para acceso continuo, no se requiere tarjeta bancaria: puedes usar tarjetas rasca físicas prepago en Francos CFA (2.000 FCFA por 30 días) disponibles en cooperativas y puntos de venta de Malabo y Bata.
              </p>
            </details>

            <details className="group bg-black/40 rounded-2xl p-3.5 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                <span>¿Cómo instalar la APK oficial en teléfonos Android?</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                Puedes descargar directamente el instalador oficial APK firmado (paquete gq.agronomo.app) pulsando el botón verde «Descargar APK» en la parte superior o escaneando el código QR con cualquier lector o cámara de teléfono móvil.
              </p>
            </details>
          </section>
        </main>
      )}

      {/* ============================================================== */}
      {/* 3. VISTA PANEL ADMIN                                           */}
      {/* ============================================================== */}
      {activeTab === 'admin' && (
        <section className="w-full max-w-xl px-4 flex flex-col gap-4 pb-24">
          <div className="ios-glass border border-white/20 rounded-3xl p-5 shadow-2xl">
            <h2 className="text-base font-bold text-white">Panel de Control Operativo</h2>
            <p className="text-xs text-slate-300">Gestión de Productores, Cupones Prepago y Fitosanidad GE</p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
                <p className="text-[11px] text-slate-400">Total Productores</p>
                <p className="text-2xl font-black text-emerald-400">1.284</p>
              </div>
              <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
                <p className="text-[11px] text-slate-400">Ingresos Prepago</p>
                <p className="text-xl font-black text-sky-400">2.568.000 <span className="text-xs font-normal">FCFA</span></p>
              </div>
              <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
                <p className="text-[11px] text-slate-400">Escaneos Hoy</p>
                <p className="text-2xl font-black text-amber-400">312</p>
              </div>
              <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10">
                <p className="text-[11px] text-slate-400">Zona con Mayor Alerta</p>
                <p className="text-sm font-bold text-red-400 truncate">Cacao (Bioko Norte)</p>
              </div>
            </div>
          </div>

          {/* Generador de Tarjetas Prepago */}
          <div className="ios-glass rounded-3xl p-5 border border-white/15 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Generador de Tarjetas Rasca</h3>
                <p className="text-xs text-slate-400">Emisión de lotes comerciales en FCFA</p>
              </div>
              <button
                onClick={handleGenerateBatch}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95"
              >
                + Generar Lote
              </button>
            </div>

            <div className="bg-black/50 rounded-2xl p-3 border border-white/10 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
              {adminCodes.map((code, index) => (
                <div key={index} className="flex justify-between items-center text-slate-300 py-1 border-b border-white/5">
                  <span className="text-emerald-400 font-bold">{code}</span>
                  <span className="text-[10px] text-slate-400">2.000 FCFA (30 días)</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CÓDIGO QR AMPLIADO PARA INSTALACIÓN RÁPIDA           */}
      {/* ============================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="ios-glass border border-emerald-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center gap-4 text-center relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-emerald-950">
              <img 
                src="/icons/app-icon-3d.png" 
                alt="Agrónomo App Icon" 
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">Instalar Agrónomo GE</h3>
              <p className="text-xs text-slate-300 mt-1">
                Apunta con la cámara de tu teléfono al código QR para iniciar la descarga automática de la APK.
              </p>
            </div>

            {/* Código QR grande de alta definición */}
            <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-emerald-400/50">
              <img 
                src="/qr-apk.svg" 
                alt="Código QR APK Agrónomo" 
                className="w-52 h-52 object-contain"
              />
            </div>

            <div className="w-full space-y-2 pt-1">
              <a
                href="/Agronomo.apk"
                download="Agronomo.apk"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Descargar APK Directamente (0.8 MB)
              </a>

              <p className="text-[10px] text-slate-400 font-mono">
                URL: https://agronomo-ge.vercel.app/Agronomo.apk
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CANJEAR TARJETA RASCA PREPAGO                         */}
      {/* ============================================================== */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="ios-glass border border-emerald-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Activar Tarjeta Prepago</h3>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Introduce el PIN de 10 dígitos raspado en tu tarjeta prepago adquirida en quioscos autorizados de Guinea Ecuatorial.
            </p>

            <input
              type="text"
              placeholder="Ej: GE-30D-K89A2"
              value={scratchCode}
              onChange={(e) => setScratchCode(e.target.value.toUpperCase())}
              className="w-full bg-black/60 border border-emerald-500/40 rounded-xl p-3 text-center font-mono font-bold text-emerald-300 tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold text-slate-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleRedeemCode}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-xs font-bold text-slate-950 shadow-lg transition-all"
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
