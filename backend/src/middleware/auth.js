/**
 * @file auth.js
 * @description Middleware de autenticación JWT con Supabase.
 * Verifica el token en cada petición y extrae el user_id.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

/**
 * Middleware que valida el JWT de Supabase.
 * Si el token es válido, agrega req.userId para uso en controladores.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }

  req.userId = user.id
  next()
}