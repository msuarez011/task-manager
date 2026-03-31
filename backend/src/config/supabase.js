/**
 * @file supabase.js
 * @description Inicializa y exporta el cliente de Supabase
 * para ser usado en toda la capa de datos del backend.
 * @author Marcelo Suárez
 * @date 2026-03-30
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// Validación temprana — falla rápido si faltan variables de entorno
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey)