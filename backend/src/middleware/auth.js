/**
 * @file auth.js
 * @description Middleware de autenticación JWT con Supabase.
 * Usa SUPABASE_SERVICE_KEY para consistencia con el controlador.
 * @author Marcelo Suárez
 * @date 2026-04-02
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

/**
 * Middleware que valida el JWT de Supabase.
 * Si el token es válido, agrega req.userId para uso en controladores.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado.' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado.' })
    }

    req.userId = user.id
    next()
  } catch (err) {
    console.error('[AUTH]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}