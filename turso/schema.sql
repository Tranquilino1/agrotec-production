-- ====================================================================
-- ESQUEMA TURSO (LibSQL / SQLite) PARA AGRÓNOMO GUINEA ECUATORIAL 🇬🇶
-- Optimizado para alta capacidad de almacenamiento (9 GB libres)
-- ====================================================================

-- 1. Tabla de Usuarios y Productores Agrícolas
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    province TEXT DEFAULT 'Litoral',
    free_scans_remaining INTEGER DEFAULT 5,
    is_subscribed INTEGER DEFAULT 0, -- 0: false, 1: true
    plan_tier TEXT DEFAULT 'free',
    subscription_expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Tarjetas Rasca / Códigos de Activación Prepago
CREATE TABLE IF NOT EXISTS activation_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    price_fcfa INTEGER NOT NULL DEFAULT 2000,
    batch_name TEXT DEFAULT 'Lote-01-Malabo-Bata',
    is_redeemed INTEGER DEFAULT 0, -- 0: false, 1: true
    redeemed_by_phone TEXT,
    redeemed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Historial Masivo de Diagnósticos por IA (Aprovechando la gran capacidad de Turso)
CREATE TABLE IF NOT EXISTS plant_diagnoses (
    id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    image_url TEXT,
    crop_detected TEXT NOT NULL,
    scientific_name TEXT,
    is_healthy INTEGER DEFAULT 0, -- 0: enferma, 1: saludable
    condition_detected TEXT NOT NULL,
    severity TEXT DEFAULT 'Baja',
    confidence REAL DEFAULT 0.90,
    description TEXT,
    symptoms_json TEXT,
    treatments_json TEXT,
    province TEXT DEFAULT 'Litoral',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Alertas Epidemiológicas por Provincias de Guinea Ecuatorial
CREATE TABLE IF NOT EXISTS outbreak_alerts (
    id TEXT PRIMARY KEY,
    disease_name TEXT NOT NULL,
    crop TEXT NOT NULL,
    province TEXT NOT NULL,
    alert_level TEXT DEFAULT 'Amarilla', -- Verde, Amarilla, Naranja, Roja
    description TEXT,
    cases_detected INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas de alta velocidad
CREATE INDEX IF NOT EXISTS idx_diagnoses_phone ON plant_diagnoses(phone_number);
CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON plant_diagnoses(crop_detected);
CREATE INDEX IF NOT EXISTS idx_diagnoses_province ON plant_diagnoses(province);
CREATE INDEX IF NOT EXISTS idx_activation_code ON activation_codes(code);

-- Semillas de Códigos Prepago de Prueba para Guinea Ecuatorial
INSERT OR IGNORE INTO activation_codes (id, code, duration_days, price_fcfa, batch_name)
VALUES 
    ('code-1', 'GE-AGRO-MES-2026', 30, 2000, 'Lanzamiento Malabo/Bata'),
    ('code-2', 'GE-AGRO-TRIM-2026', 90, 5000, 'Lanzamiento Cosecha'),
    ('code-3', 'BATA-COOP-VIP', 180, 10000, 'Cooperativas Litoral'),
    ('code-4', 'BIOKO-CACAO-VIP', 180, 10000, 'Cooperativas Bioko');
