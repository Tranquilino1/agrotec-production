-- ====================================================================
-- AGRÓNOMO GUINEA ECUATORIAL - ESQUEMA DE BASE DE DATOS (SUPABASE)
-- ====================================================================

-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    province TEXT DEFAULT 'Litoral' CHECK (province IN ('Litoral', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 'Kie-Ntem', 'Wele-Nzas', 'Annobón')),
    free_scans_remaining INT DEFAULT 5,
    is_subscribed BOOLEAN DEFAULT FALSE,
    plan_tier TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Tarjetas Rasca / Códigos de Activación Prepago
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    duration_days INT NOT NULL DEFAULT 30,
    price_fcfa INT NOT NULL DEFAULT 2000,
    batch_name TEXT DEFAULT 'Lote-01-Malabo-Bata',
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_by_phone TEXT,
    redeemed_by_user UUID REFERENCES public.profiles(id),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Historial de Diagnósticos por IA
CREATE TABLE IF NOT EXISTS public.plant_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    image_url TEXT NOT NULL,
    crop_detected TEXT NOT NULL,
    scientific_name TEXT,
    is_healthy BOOLEAN NOT NULL DEFAULT FALSE,
    condition_detected TEXT NOT NULL,
    severity TEXT DEFAULT 'Baja' CHECK (severity IN ('Ninguna', 'Baja', 'Moderada', 'Alta', 'Severa')),
    confidence NUMERIC(4, 2) DEFAULT 0.90,
    symptoms JSONB DEFAULT '[]'::jsonb,
    treatments JSONB DEFAULT '{}'::jsonb,
    province TEXT DEFAULT 'Litoral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Alertas Fitosanitarias de Brotes (Para el Ministerio y Cooperativas)
CREATE TABLE IF NOT EXISTS public.outbreak_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name TEXT NOT NULL,
    crop TEXT NOT NULL,
    province TEXT NOT NULL,
    alert_level TEXT DEFAULT 'Amarilla' CHECK (alert_level IN ('Verde', 'Amarilla', 'Naranja', 'Roja')),
    description TEXT,
    cases_detected INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- FUNCIONES RPC ATÓMICAS (Canje Seguro de Códigos Prepago)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.redeem_scratch_code(
    p_phone TEXT,
    p_code TEXT
) RETURNS JSONB AS $$
DECLARE
    v_code_record RECORD;
    v_user_record RECORD;
    v_new_expiry TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    -- 1. Buscar código y bloquear fila para evitar doble canje
    SELECT * INTO v_code_record FROM public.activation_codes 
    WHERE UPPER(code) = UPPER(TRIM(p_code)) AND is_redeemed = FALSE 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'El código de activación es inválido o ya ha sido utilizado.');
    END IF;

    -- 2. Buscar perfil de usuario
    SELECT * INTO v_user_record FROM public.profiles 
    WHERE phone_number = TRIM(p_phone)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario no registrado con este número telefónico.');
    END IF;

    -- 3. Calcular nueva fecha de vencimiento
    IF v_user_record.is_subscribed AND v_user_record.subscription_expires_at > v_now THEN
        v_new_expiry := v_user_record.subscription_expires_at + (v_code_record.duration_days || ' days')::INTERVAL;
    ELSE
        v_new_expiry := v_now + (v_code_record.duration_days || ' days')::INTERVAL;
    END IF;

    -- 4. Actualizar usuario a suscriptor activo
    UPDATE public.profiles
    SET is_subscribed = TRUE,
        plan_tier = 'premium_ge',
        subscription_expires_at = v_new_expiry,
        updated_at = v_now
    WHERE id = v_user_record.id;

    -- 5. Marcar código como canjeado
    UPDATE public.activation_codes
    SET is_redeemed = TRUE,
        redeemed_by_phone = p_phone,
        redeemed_by_user = v_user_record.id,
        redeemed_at = v_now
    WHERE id = v_code_record.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', '¡Suscripción activada con éxito!',
        'valid_until', v_new_expiry,
        'duration_days', v_code_record.duration_days
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- SEMILLAS DE PRUEBA (Códigos de prepago listos para usar)
-- ====================================================================

INSERT INTO public.activation_codes (code, duration_days, price_fcfa, batch_name)
VALUES 
    ('GE-AGRO-MES-2026', 30, 2000, 'Lanzamiento Malabo/Bata'),
    ('GE-AGRO-TRIM-2026', 90, 5000, 'Lanzamiento Cosecha'),
    ('BATA-COOP-VIP', 180, 10000, 'Cooperativas Litoral'),
    ('BIOKO-CACAO-VIP', 180, 10000, 'Cooperativas Bioko')
ON CONFLICT (code) DO NOTHING;
