import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epifjpbwbnphlhhfhigm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwaWZqcGJ3Ym5waGxoaGZoaWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDM5MzUsImV4cCI6MjEwNTQ3OTkzNX0.NJ6tXBTHgXWvHRS5q9lBnNnann619yNhcqxd3tbqGCU';

// Cliente público para el navegador / PWA
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con permisos de administración (para API Routes y Panel de Control)
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwaWZqcGJ3Ym5waGxoaGZoaWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkwMzkzNSwiZXhwIjoyMTA1NDc5OTM1fQ.YB5UaOs7bWT1ZDR67hM3HPVe2ymNE2KT34S51QJa7Zo';
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
