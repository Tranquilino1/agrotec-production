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

// Guía de Plagas y Enfermedades de Guinea Ecuatorial (Estilo Plantix Library)
const PEST_GUIDE_DATA = [
  {
    id: 'cacao_mazorca_negra',
    crop: 'Cacao (Bioko)',
    cropId: 'cacao',
    cropIcon: '🍫',
    disease: 'Mazorca Negra (Phytophthora palmivora)',
    type: 'Hongo Fitopatógeno',
    typeColor: 'text-purple-300 bg-purple-950/60 border-purple-500/40',
    symptoms: 'Mancha marrón oscura que invade toda la mazorca en 4-7 días, produciendo podredumbre y pérdida del grano.',
    organicRecipe: 'Poda de ramas para aireación solar + retirar mazorcas enfermas a fosa cubierta con cal viva.',
    chemicalDose: 'Oxicloruro de Cobre al 50%: 4 cucharadas soperas (40g) por mochila de 15L + 1 tapón adherente antilluvia.',
    season: 'Época de lluvias intensas (Mayo - Noviembre)'
  },
  {
    id: 'yuca_mosaico',
    crop: 'Yuca Tropical',
    cropId: 'yuca',
    cropIcon: '🥔',
    disease: 'Mosaico Africano de la Yuca (CMD)',
    type: 'Infección Viral (Mosca Blanca)',
    typeColor: 'text-red-300 bg-red-950/60 border-red-500/40',
    symptoms: 'Hojas arrugadas y retorcidas con manchas amarillas en mosaico. Reduce la cosecha de raíces hasta un 70%.',
    organicRecipe: 'Arrancar y quemar plantas enfermas jóvenes. Emplear estacas sanas provenientes de parcelas limpias.',
    chemicalDose: 'Aceite de Neem o Jabón potásico: 3 tapones (45ml) por mochila de 15L para controlar el vector mosca blanca.',
    season: 'Primeros 3 meses tras la brotación'
  },
  {
    id: 'platano_sigatoka',
    crop: 'Plátano y Banano',
    cropId: 'platano',
    cropIcon: '🍌',
    disease: 'Sigatoka Negra (Pseudocercospora fijiensis)',
    type: 'Hongo Foliar',
    typeColor: 'text-purple-300 bg-purple-950/60 border-purple-500/40',
    symptoms: 'Rayas rojizas paralelas a las nervaduras que se necrosan, quemando el follaje y madurando el racimo prematuramente.',
    organicRecipe: 'Deshoje fitosanitario semanal eliminando hojas secas y colocándolas boca abajo en el suelo.',
    chemicalDose: 'Fungicida Triazol o Cobre: 4 cucharadas por mochila de 15L cada 21 días en periodos lluviosos.',
    season: 'Humedad relativa superior al 85%'
  },
  {
    id: 'cafe_broca',
    crop: 'Café Robusta',
    cropId: 'cafe',
    cropIcon: '☕',
    disease: 'Broca del Café (Hypothenemus hampei)',
    type: 'Insecto / Plaga Perforadora',
    typeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40',
    symptoms: 'Pequeño orificio en la corona del fruto verde o cereza madura. El insecto destruye el grano por dentro.',
    organicRecipe: 'Instalación de trampas de botella con alcohol + café y recolección minuciosa de frutos caídos al suelo.',
    chemicalDose: 'Bioinsecticida Beauveria bassiana: 3 tapones por mochila de 15L dirigidos a la zona de fructificación.',
    season: 'Desde 90 días después de la floración'
  }
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
  const [mobileTab, setMobileTab] = useState<'scan' | 'calc' | 'guide' | 'install'>('scan');
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

  // Estado para Calculadora Rápida de Mochilas (15L) en Finca
  const [calcProduct, setCalcProduct] = useState<'cobre' | 'neem' | 'bordeles' | 'foliar'>('cobre');
  const [calcBackpacks, setCalcBackpacks] = useState(2);

  // Función para forzar limpieza total de caché PWA
  const handleClearCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  // Registrar Service Worker y purgar cachés antiguos automáticamente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Purgar caches de versiones anteriores
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name !== 'agronomo-ge-cache-v3.3.0') {
              console.log('[Agrónomo PWA] Purgando caché anterior:', name);
              caches.delete(name);
            }
          });
        });
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('[Agrónomo PWA] Service Worker activo v3.3.0:', reg.scope);
          reg.update();
        }).catch((err) => {
          console.error('[Agrónomo PWA] Error SW:', err);
        });
      }
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

  // Función central para ejecutar diagnóstico
  const executeDiagnosis = async (file: File, demo: boolean) => {
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('phone_number', phoneNumber);
      formData.append('province', 'Bioko Norte');
      formData.append('organ', selectedOrgan);
      if (demo) {
        formData.append('is_demo', 'true');
      }

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setDiagnosticResult(data.data);
        if (!demo && data.quota_remaining !== undefined) {
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

  // Cargar imagen de muestra de Cacao (Demo en 1-Clic automática)
  const handleLoadDemoImage = async () => {
    try {
      const response = await fetch('/sample-cacao.jpg');
      const blob = await response.blob();
      const file = new File([blob], 'sample-cacao.jpg', { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreview('/sample-cacao.jpg');
      setIsDemoMode(true);
      setDiagnosticResult(null);
      await executeDiagnosis(file, true);
    } catch (err) {
      console.error('Error cargando demo:', err);
    }
  };

  // Enviar imagen seleccionada manualmente
  const handleAnalyzePlant = async () => {
    if (!imageFile) return;
    await executeDiagnosis(imageFile, isDemoMode);
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
      {/* 1. BARRA SUPERIOR MINIMALISTA ESTILO PLANTIX                   */}
      {/* ============================================================== */}
      <header className="w-full max-w-xl sticky top-2 z-40 px-3 mb-2">
        <div className="ios-glass rounded-2xl p-2.5 flex items-center justify-between shadow-xl border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow border border-white/20 bg-emerald-950 flex-shrink-0">
              <img 
                src="/icons/app-icon-3d.png" 
                alt="Agrónomo 3D Icon" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">Agrónomo</h1>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                  GE 🇬🇶
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/80 font-medium">Clínica IA & Fitosanidad</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRedeemModal(true)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                isSubscribed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              <span>🪙</span>
              <span>{isSubscribed ? 'VIP' : `${quotaRemaining} Escaneos`}</span>
            </button>

            <a
              href="/admin"
              className="px-2.5 py-1 rounded-xl font-bold bg-sky-600/80 hover:bg-sky-500 text-white shadow text-[10px] flex items-center gap-1 transition-all"
            >
              <span>📊</span>
              <span>Admin</span>
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. VISTA PRINCIPAL: AGRICULTOR (ESTILO PLANTIX TOP UX)         */}
      {/* ============================================================== */}
      {activeTab === 'farmer' && (
        <main className="w-full max-w-xl px-3 flex flex-col gap-3 pb-28">

          {/* ========================================================== */}
          {/* TAB 1: ESCANEAR (CÁMARA INMEDIATA, RETÍCULA & DOSSIER)     */}
          {/* ========================================================== */}
          {mobileTab === 'scan' && (
            <div className="flex flex-col gap-3">
              {/* SELECTOR HORIZONTAL DE CULTIVOS (PLANTIX CHIPS) */}
              {!diagnosticResult && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      Cultivo a examinar:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Desliza →</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {CROP_CATEGORIES.map((crop) => {
                      const isSelected = selectedCrop === crop.id;
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => setSelectedCrop(crop.id)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs ${
                            isSelected
                              ? 'bg-emerald-500/30 border-emerald-400 text-white font-bold shadow-md shadow-emerald-900/40'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-sm">{crop.icon}</span>
                          <span className="truncate">{crop.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Micro-pills de Órgano botánico */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                    <span className="text-[10px] text-slate-400 flex-shrink-0 px-1">Órgano:</span>
                    {PLANT_ORGANS.map((organ) => {
                      const isSelected = selectedOrgan === organ.id;
                      return (
                        <button
                          key={organ.id}
                          type="button"
                          onClick={() => setSelectedOrgan(organ.id)}
                          className={`flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] border transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{organ.icon}</span>
                          <span>{organ.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISOR ÓPTICO DE CÁMARA & RETÍCULA INTELIGENTE (PLANTIX FRONT-AND-CENTER) */}
              {!diagnosticResult && (
                <div className="relative rounded-3xl ios-glass border border-white/15 overflow-hidden shadow-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
                  {/* Viewfinder brackets */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl pointer-events-none" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-xl pointer-events-none" />

                  {imagePreview ? (
                    <div className="relative w-full flex flex-col items-center">
                      <div className="relative w-full max-h-[290px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                        <img
                          src={imagePreview}
                          alt="Muestra botánica cargada"
                          className="w-full h-full max-h-[290px] object-cover object-center"
                        />
                        {isScanning && (
                          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin" />
                            <div className="text-center px-4">
                              <p className="text-sm font-extrabold text-emerald-300">
                                Diagnosticando patología tropical...
                              </p>
                              <p className="text-[11px] text-slate-300 mt-0.5">
                                Calculando severidad y receta fitosanitaria
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {!isScanning && (
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setDiagnosticResult(null);
                            setIsDemoMode(false);
                          }}
                          className="mt-2.5 text-xs text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-4"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Cambiar fotografía
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Shutter Plantix: Acción instantánea */
                    <div className="flex flex-col items-center text-center gap-3 py-3 z-10 w-full max-w-xs">
                      <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border border-emerald-400/30 bg-emerald-950/60 p-1 group hover:scale-105 transition-transform">
                        <img 
                          src="/icons/scanner-3d.png" 
                          alt="Escáner 3D" 
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-white">
                          Enfoca la Hoja o Fruto Enfermo
                        </h3>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          Centra la lesión en la retícula con buena luz natural.
                        </p>
                      </div>

                      {/* Disparadores principales */}
                      <div className="flex flex-col gap-2 w-full pt-1">
                        <label className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95 transition-all">
                          <Camera className="w-5 h-5 text-slate-950" />
                          <span>Tomar Fotografía</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageCapture}
                            className="hidden"
                          />
                        </label>

                        <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs border border-white/10 cursor-pointer active:scale-95 transition-all">
                          <span>Subir de Galería</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageCapture}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* 1-Tap Demo Sample */}
                      <button
                        onClick={handleLoadDemoImage}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 pt-0.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Probar con muestra de Cacao (Demo instantánea)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de análisis manual si se subió foto manualmente */}
              {imagePreview && !diagnosticResult && (
                <button
                  onClick={handleAnalyzePlant}
                  disabled={isScanning}
                  className="w-full py-3.5 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 shadow-xl shadow-emerald-500/25 border border-white/30 flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>Ejecutar Diagnóstico Fitosanitario con IA</span>
                </button>
              )}

              {/* DOSSIER CLÍNICO AGRONÓMICO (BENCHMARK TOP 10) */}
              {diagnosticResult && (
                <section className="ios-glass rounded-3xl p-4 border border-emerald-500/30 shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {/* Encabezado clínico */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-lg flex-shrink-0 bg-emerald-950">
                        <img 
                          src="/icons/shield-3d.png" 
                          alt="Certificado Fitosanitario" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">
                          Dossier Fitosanitario GE
                        </span>
                        <h3 className="text-base font-black text-white leading-tight">
                          {diagnosticResult.crop_detected}
                        </h3>
                        <p className="text-[11px] italic text-slate-400">
                          {diagnosticResult.scientific_name || 'Especie tropical evaluada'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {((diagnosticResult.confidence || 0.95) * 100).toFixed(0)}% Fiabilidad
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {diagnosticResult.organ_analyzed || 'Muestra campo'}
                      </p>
                    </div>
                  </div>

                  {/* Patología y Categoría */}
                  <div className="bg-black/40 rounded-2xl p-3.5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      {(() => {
                        const badge = getPathogenBadge(diagnosticResult.pathogen_category || 'fungal');
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        );
                      })()}

                      {(() => {
                        const sev = getSeverityBadge(diagnosticResult.severity_level || diagnosticResult.severity || 'moderate');
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${sev.color}`}>
                            {sev.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        {diagnosticResult.condition_detected}
                      </h4>
                      {diagnosticResult.pathogen_scientific && (
                        <p className="text-[11px] italic text-emerald-400">
                          Agente causal: {diagnosticResult.pathogen_scientific}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                        {diagnosticResult.description}
                      </p>
                    </div>

                    {/* Medidor visual de daño foliar */}
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-300">
                        <span>Área Foliar Dañada (% DLA):</span>
                        <span className="font-bold text-amber-400">{diagnosticResult.severity_percentage || 28}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
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

                  {/* Diagnósticos Diferenciales */}
                  {diagnosticResult.differential_diagnoses && diagnosticResult.differential_diagnoses.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-2.5 border border-white/5 space-y-1 text-xs">
                      <p className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                        Descarte Diferencial:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {diagnosticResult.differential_diagnoses.map((diff: any, idx: number) => (
                          <span key={idx} className="bg-black/40 text-slate-300 px-2 py-0.5 rounded-lg border border-white/10 text-[10px]">
                            {diff.condition} ({(diff.probability * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Síntomas verificados */}
                  {diagnosticResult.symptoms && (
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 space-y-1 text-xs">
                      <p className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Síntomas Característicos:
                      </p>
                      {Array.isArray(diagnosticResult.symptoms) ? (
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1 text-[11px]">
                          {diagnosticResult.symptoms.map((sym: string, i: number) => (
                            <li key={i}>{sym}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-300 pl-1 leading-relaxed text-[11px]">
                          {String(diagnosticResult.symptoms)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Plan de Tratamiento Dual */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        Tratamiento Recomendado:
                      </h4>

                      <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/10 text-[10px]">
                        <button
                          onClick={() => setTreatmentStrategy('organic')}
                          className={`px-2 py-1 rounded-lg font-bold transition-all ${
                            treatmentStrategy === 'organic'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          🌿 Casero / Bio
                        </button>
                        <button
                          onClick={() => setTreatmentStrategy('chemical')}
                          className={`px-2 py-1 rounded-lg font-bold transition-all ${
                            treatmentStrategy === 'chemical'
                              ? 'bg-sky-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          🧪 Químico
                        </button>
                      </div>
                    </div>

                    {/* Estrategia 1: Casero */}
                    {treatmentStrategy === 'organic' && (
                      <div className="bg-gradient-to-r from-emerald-950/70 to-emerald-900/40 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-emerald-300 text-xs">
                            🌿 {diagnosticResult.treatments?.organic_home?.title || 'Remedio Agroecológico'}
                          </p>
                          <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                            {diagnosticResult.treatments?.organic_home?.cost_estimate || '0 FCFA'}
                          </span>
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          {diagnosticResult.treatments?.organic_home?.recipe || diagnosticResult.treatments?.biological || 'Retirar partes enfermas y aplicar caldo de ceniza.'}
                        </p>
                        <div className="bg-black/40 p-2 rounded-xl border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>
                            <strong>Dosis Mochila 15L:</strong> {diagnosticResult.treatments?.organic_home?.dosage_backpack_15L || '4 cucharadas por mochila de 15L'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estrategia 2: Fitosanitario Comercial */}
                    {treatmentStrategy === 'chemical' && (
                      <div className="bg-gradient-to-r from-sky-950/70 to-indigo-950/40 border border-sky-500/30 rounded-2xl p-3 text-xs space-y-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-sky-400 tracking-wider">
                            Materia Activa Recomendada
                          </span>
                          <p className="font-extrabold text-white text-xs">
                            🧪 {diagnosticResult.treatments?.chemical_commercial?.active_ingredient || 'Oxicloruro de Cobre al 50% WP'}
                          </p>
                        </div>

                        {/* Calculadora en el reporte */}
                        <div className="bg-black/60 rounded-xl p-2.5 border border-sky-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5 text-sky-400" />
                              Mochilas de 15 Litros:
                            </span>
                            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-lg">
                              <button
                                onClick={() => setBackpackCount(Math.max(1, backpackCount - 1))}
                                className="text-xs font-black text-sky-400 hover:text-white px-1"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-white text-xs">{backpackCount} ({backpackCount * 15}L)</span>
                              <button
                                onClick={() => setBackpackCount(backpackCount + 1)}
                                className="text-xs font-black text-sky-400 hover:text-white px-1"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="bg-white/5 p-1.5 rounded-lg">
                              <p className="text-slate-400">Dosis Producto:</p>
                              <p className="font-bold text-sky-300">
                                {backpackCount * 4} Cucharadas ({backpackCount * 40}g)
                              </p>
                            </div>
                            <div className="bg-white/5 p-1.5 rounded-lg">
                              <p className="text-slate-400">Adherente Antilluvia:</p>
                              <p className="font-bold text-sky-300">
                                {backpackCount * 1} Tapón ({backpackCount * 10} ml)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Plazos de Seguridad */}
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-2.5 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Seguridad Fitosanitaria:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="bg-black/40 p-1.5 rounded-lg border border-amber-500/20">
                          <p className="text-slate-400">Plazo Carencia (PHI):</p>
                          <p className="font-bold text-white">
                            {diagnosticResult.treatments?.safety?.phi_days || 14} Días antes cosecha
                          </p>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg border border-amber-500/20">
                          <p className="text-slate-400">Reentrada (REI):</p>
                          <p className="font-bold text-white">
                            {diagnosticResult.treatments?.safety?.rei_hours || 24} Horas restringidas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={handleShareWhatsApp}
                      className="w-full sm:flex-1 py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Enviar a WhatsApp (Segunda Opinión)</span>
                    </button>

                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setDiagnosticResult(null);
                        setIsDemoMode(false);
                      }}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all active:scale-95"
                    >
                      Nuevo Escaneo
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: CALCULADORA RÁPIDA DE MOCHILAS 15L                  */}
          {/* ========================================================== */}
          {mobileTab === 'calc' && (
            <div className="flex flex-col gap-3">
              <section className="ios-glass rounded-3xl p-4 border border-emerald-500/25 shadow-xl space-y-3.5 bg-gradient-to-br from-emerald-950/30 via-slate-900/40 to-black/60">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🎒</span>
                      <h3 className="font-extrabold text-sm text-white">Calculadora de Mochilas (15 Litros)</h3>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Dosificación exacta calibrada para pulverizadores de espalda en Guinea Ecuatorial
                    </p>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
                    Uso en Finca
                  </span>
                </div>

                {/* Selector de Producto */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Selecciona el tratamiento fitosanitario:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'cobre', name: 'Oxicloruro Cobre', sub: 'Fungicida Cacao/Café', icon: '🍄' },
                      { id: 'neem', name: 'Aceite de Neem / Jabón', sub: 'Insecticida Bio Plagas', icon: '🌿' },
                      { id: 'bordeles', name: 'Caldo Bordelés', sub: 'Cobre + Cal tradicional', icon: '🧪' },
                      { id: 'foliar', name: 'Abono Foliar NPK', sub: 'Vigorizante Foliar', icon: '🌱' },
                    ].map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setCalcProduct(prod.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          calcProduct === prod.id
                            ? 'bg-emerald-500/25 border-emerald-400 text-white shadow'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{prod.icon}</span>
                          <p className="font-bold text-[11px] text-white leading-tight truncate">{prod.name}</p>
                        </div>
                        <p className="text-[9px] text-slate-300 truncate mt-0.5">{prod.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contador de Mochilas y Cálculos */}
                <div className="bg-black/50 rounded-2xl p-3.5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      ¿Cuántas mochilas vas a preparar?
                    </span>
                    <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCalcBackpacks(Math.max(1, calcBackpacks - 1))}
                        className="text-base font-black text-emerald-400 hover:text-white px-1 leading-none"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white text-xs">
                        {calcBackpacks} {calcBackpacks === 1 ? 'mochila' : 'mochilas'} ({calcBackpacks * 15}L)
                      </span>
                      <button
                        type="button"
                        onClick={() => setCalcBackpacks(calcBackpacks + 1)}
                        className="text-base font-black text-emerald-400 hover:text-white px-1 leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Receta calculada */}
                  {(() => {
                    let doseText = '';
                    let adherenceText = `${calcBackpacks * 1} Tapón (${calcBackpacks * 10} ml) Jabón/Adherente`;
                    let approxCost = `${calcBackpacks * 1500} - ${calcBackpacks * 2500} FCFA`;
                    let coverageText = `~${calcBackpacks * 35} árboles adultos / ${calcBackpacks * 150}m²`;

                    if (calcProduct === 'cobre') {
                      doseText = `${calcBackpacks * 4} Cucharadas soperas (${calcBackpacks * 40}g de Cobre al 50%)`;
                    } else if (calcProduct === 'neem') {
                      doseText = `${calcBackpacks * 3} Tapones dosificadores (${calcBackpacks * 45}ml de extracto)`;
                      approxCost = `${calcBackpacks * 1000} FCFA`;
                    } else if (calcProduct === 'bordeles') {
                      doseText = `${calcBackpacks * 5} Cucharadas (${calcBackpacks * 50}g Sulfato + ${calcBackpacks * 50}g Cal)`;
                      approxCost = `${calcBackpacks * 800} FCFA`;
                    } else {
                      doseText = `${calcBackpacks * 2.5} Cucharadas (${calcBackpacks * 30}g soluble foliar)`;
                      approxCost = `${calcBackpacks * 1200} FCFA`;
                    }

                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-slate-400">Dosis de Producto:</p>
                            <p className="text-xs font-bold text-emerald-300 mt-0.5">{doseText}</p>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-slate-400">Adherente Antilluvia:</p>
                            <p className="text-xs font-bold text-sky-300 mt-0.5">{adherenceText}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-300 px-1 pt-1 border-t border-white/10">
                          <span>🌾 Cobertura: {coverageText}</span>
                          <span>💰 Coste estimado: {approxCost}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <p className="text-[10px] text-emerald-400/90 italic flex items-center gap-1 px-1">
                  💡 <span>En climas lluviosos de Guinea Ecuatorial, pulverizar temprano sin sol directo y usar boquilla cónica.</span>
                </p>
              </section>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: GUÍA FITOSANITARIA DE PLAGAS GE (PLANTIX LIBRARY)    */}
          {/* ========================================================== */}
          {mobileTab === 'guide' && (
            <div className="flex flex-col gap-3">
              <div className="px-1">
                <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  Biblioteca Fitosanitaria Guinea Ecuatorial
                </h2>
                <p className="text-[11px] text-slate-300">
                  Principales plagas y enfermedades comunes en Bioko, Litoral y Río Muni
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {PEST_GUIDE_DATA.map((pest) => (
                  <div key={pest.id} className="ios-glass rounded-2xl p-3.5 border border-white/10 space-y-2.5">
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{pest.cropIcon}</span>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">{pest.crop}</p>
                          <h3 className="font-extrabold text-xs text-white leading-tight">{pest.disease}</h3>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${pest.typeColor} flex-shrink-0`}>
                        {pest.type}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <p className="text-slate-300 leading-relaxed">
                        <strong className="text-amber-300">Síntomas:</strong> {pest.symptoms}
                      </p>
                      <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20 text-emerald-200">
                        <strong>🌿 Manejo Agroecológico:</strong> {pest.organicRecipe}
                      </div>
                      <div className="bg-sky-950/40 p-2 rounded-xl border border-sky-500/20 text-sky-200">
                        <strong>🧪 Dosis Mochila 15L:</strong> {pest.chemicalDose}
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        🗓️ Época de riesgo: {pest.season}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCrop(pest.cropId);
                        setMobileTab('scan');
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Escanear muestra de {pest.crop}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: INSTALAR APP, TARJETAS PREPAGO & FAQ                */}
          {/* ========================================================== */}
          {mobileTab === 'install' && (
            <div className="flex flex-col gap-3">
              {/* Tarjeta de descarga de APK */}
              <section className="relative overflow-hidden rounded-3xl ios-card p-4 border border-emerald-500/25 shadow-xl bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">
                        Instalador Oficial Android
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-white leading-tight">
                      Instala Agrónomo en tu Teléfono
                    </h2>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Descarga directa de la aplicación nativa firmada (.apk) para uso con baja cobertura en parcelas.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="/Agronomo.apk"
                        download="Agronomo.apk"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95"
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

                  <div 
                    onClick={() => setShowQrModal(true)}
                    className="cursor-pointer bg-white p-2 rounded-2xl shadow-md border-2 border-emerald-400/40 hover:scale-105 transition-transform flex-shrink-0 flex flex-col items-center"
                    title="Toca para ampliar el QR"
                  >
                    <img 
                      src="/qr-apk.svg" 
                      alt="QR APK" 
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-[9px] font-bold text-emerald-950 mt-0.5">Escanear</span>
                  </div>
                </div>
              </section>

              {/* Perfil & Tarjetas Prepago en FCFA */}
              <div className="ios-glass rounded-2xl p-3.5 flex items-center justify-between border border-white/10 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Productor Registrado</p>
                    <p className="text-xs font-bold text-slate-200">{phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    isSubscribed 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {isSubscribed ? 'VIP Ilimitado' : `${quotaRemaining} Escaneos`}
                  </span>
                  <button
                    onClick={() => setShowRedeemModal(true)}
                    className="text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 rounded-xl transition-all"
                  >
                    + Tarjeta
                  </button>
                </div>
              </div>

              {/* Preguntas Frecuentes FAQ */}
              <section className="ios-glass rounded-3xl p-4 border border-white/10 shadow-xl space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-xs text-emerald-300">
                    Preguntas Frecuentes (Guinea Ecuatorial)
                  </h3>
                </div>
                
                <details className="group bg-black/40 rounded-xl p-3 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                    <span>¿Cómo funciona el diagnóstico de plantas con IA?</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
                  </summary>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                    Apunta la cámara a la zona enferma. La IA examina los síntomas frente a cientos de patologías tropicales de Bioko y Río Muni (Mazorca Negra, Monilia, Mosaico de la Yuca o Sigatoka).
                  </p>
                </details>

                <details className="group bg-black/40 rounded-xl p-3 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                    <span>¿Cómo se calculan las dosis en la mochila de 15L?</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
                  </summary>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                    Agrónomo GE calibra las dosis para mochilas pulverizadoras de espalda de 15 Litros, indicando la cantidad exacta en cucharadas soperas o tapones para evitar quemar la cosecha.
                  </p>
                </details>

                <details className="group bg-black/40 rounded-xl p-3 border border-white/5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-200">
                    <span>¿Cómo se pagan las tarjetas prepago en FCFA?</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition duration-300 group-open:-rotate-180" />
                  </summary>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                    No se requiere tarjeta bancaria: puedes usar tarjetas rasca físicas prepago en Francos CFA (2.000 FCFA por 30 días) raspando el PIN de 10 dígitos.
                  </p>
                </details>
              </section>

              {/* Botón de purga de caché y footer */}
              <div className="flex flex-col items-center text-center gap-2 pt-2">
                <button
                  onClick={handleClearCacheAndReload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-[11px] font-semibold transition-all shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🔄 Limpiar Caché y Actualizar App</span>
                </button>
                <p className="text-[10px] text-slate-500">
                  Agrónomo GE v3.3.0 • Plantix UX Pro • Guinea Ecuatorial
                </p>
              </div>
            </div>
          )}
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
      {/* 4. BARRA DE NAVEGACIÓN INFERIOR ESTILO PLANTIX (MOBILE NATIVE) */}
      {/* ============================================================== */}
      {activeTab === 'farmer' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#06120A]/95 backdrop-blur-2xl border-t border-emerald-500/20 px-3 py-2 flex justify-around items-center max-w-xl mx-auto shadow-2xl">
          <button
            type="button"
            onClick={() => setMobileTab('scan')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'scan'
                ? 'text-emerald-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${mobileTab === 'scan' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Escanear</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('calc')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'calc'
                ? 'text-emerald-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${mobileTab === 'calc' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Mochila 15L</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('guide')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'guide'
                ? 'text-emerald-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${mobileTab === 'guide' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Guía Plagas</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('install')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
              mobileTab === 'install'
                ? 'text-emerald-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${mobileTab === 'install' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
              <Download className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Instalar App</span>
          </button>
        </nav>
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
