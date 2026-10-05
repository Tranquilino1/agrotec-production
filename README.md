# Agrónomo PWA & Admin Dashboard 🇬🇶🌱

Aplicación Web Progresiva (PWA) de diagnóstico agrícola por Inteligencia Artificial y Panel de Control Administrativo diseñado para **Guinea Ecuatorial**.

---

## 🌟 Características Principales

1. **Instalable como PWA en Android e iOS:**
   * Sin necesidad de Google Play Store. Se instala directamente desde el navegador Chrome, Safari o Edge con un toque en "Añadir a pantalla de inicio".
   * Iconos oficiales optimizados (192x192, 512x512 y SVG vectorial).
2. **Modo Fuera de Línea (Offline) con Service Worker:**
   * En zonas selváticas o remotas de Bioko y Río Muni sin cobertura 3G/4G, el Service Worker activa la pantalla [`public/offline.html`](public/offline.html) con guías agronómicas de emergencia para Cacao, Yuca y Plátano.
3. **Visión por IA Universal (+300.000 Plantas):**
   * Motor conectado a Google Gemini 1.5 Flash Vision capaz de identificar casi cualquier planta, hongo, plaga o deficiencia mineral del mundo.
4. **Diseño Futurista Glassmorphism:**
   * Interfaz acrílica translúcida con acentos nacionales de Guinea Ecuatorial (Verde bosque, Azul ecuatorial, Rojo libertad y Blanco puro).
5. **Panel Administrativo Integrado:**
   * Vista de administrador para ver estadísticas de agricultores en Guinea Ecuatorial, ingresos en FCFA y generar lotes de tarjetas prepago imprimibles.

---

## 🚀 Despliegue en Vercel en 2 Minutos

### 1. Variables de Entorno (Environment Variables) en Vercel
En tu panel de Vercel (Settings > Environment Variables), añade:

* `GEMINI_API_KEY`: Tu clave de Google Gemini AI (para inferencia visual en tiempo real).
* `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto en Supabase (ej: `https://xyz.supabase.co`).
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima pública de Supabase.
* `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de administración de Supabase.

### 2. Configurar la Base de Datos en Supabase
1. Entra en tu panel de **Supabase** y ve al **SQL Editor**.
2. Copia y pega el contenido del archivo [`supabase/schema.sql`](supabase/schema.sql).
3. Haz clic en **Run**. ¡Todas las tablas, índices, códigos de prueba y funciones de canje quedarán creadas automáticamente!

### 3. Probar en Desarrollo Local
```bash
cd agronomo_pwa
npm install
npm run dev
```
Abre en tu navegador: **`http://localhost:3000`**
