/**
 * @file tasksController.js
 * @description Controlador REST para el recurso Tasks.
 * Todas las operaciones filtran por user_id del token JWT.
 * Errores internos no se exponen al cliente.
 * Incluye límite de 100 tareas por usuario y sanitización básica.
 * @author Marcelo Suárez
 * @date 2026-04-02
 */

import { supabase } from '../config/supabase.js'

/**
 * Sanitiza el título eliminando caracteres peligrosos para XSS.
 * @param {string} str - Texto a sanitizar
 * @returns {string} Texto limpio
 */
const sanitize = (str) => str.replace(/[<>]/g, '').trim()

/**
 * Detecta automáticamente la prioridad de una tarea según su título.
 * @param {string} title - Título de la tarea
 * @returns {'high'|'medium'|'low'} Prioridad detectada
 */
const detectPriority = (title) => {
  const text = title.toLowerCase()

  const highKeywords = [
    'urgente', 'urgent', 'importante', 'critical', 'crítico',
    'emergencia', 'ya', 'ahora', 'hoy', 'deadline', 'entregar',
    'examen', 'reunión', 'reunion', 'presentación', 'presentacion',
    'pagar', 'médico', 'medico', 'doctor', 'cita', 'trabajo',
    'jefe', 'cliente', 'proyecto', 'entrega', 'vence'
  ]

  const lowKeywords = [
    'cuando pueda', 'algún día', 'algun dia', 'después', 'despues',
    'opcional', 'leisure', 'ocio', 'leer', 'ver', 'explorar',
    'investigar', 'revisar', 'pensar', 'considerar', 'quizás',
    'quizas', 'tal vez', 'hobby', 'jugar', 'paseo', 'caminar'
  ]

  if (highKeywords.some(kw => text.includes(kw))) return 'high'
  if (lowKeywords.some(kw => text.includes(kw))) return 'low'
  return 'medium'
}

/**
 * Obtiene todas las tareas del usuario autenticado.
 * @route GET /api/tasks
 */
export const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[GET /tasks]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

/**
 * Crea una nueva tarea asociada al usuario autenticado.
 * Límite máximo de 100 tareas por usuario.
 * @route POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const raw = req.body.title
    if (!raw || raw.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    const title = sanitize(raw)

    if (title.length === 0) {
      return res.status(400).json({ error: 'El título contiene caracteres no válidos.' })
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Máximo 200 caracteres.' })
    }

    // Verificar límite de tareas por usuario
    const { count, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)

    if (countError) throw countError

    if (count >= 100) {
      return res.status(429).json({ error: 'Límite de 100 tareas alcanzado. Elimina algunas para continuar.' })
    }

    const priority = detectPriority(title)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, priority, user_id: req.userId }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('[POST /tasks]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

/**
 * Invierte el estado completed de una tarea del usuario.
 * @route PATCH /api/tasks/:id/toggle
 */
export const toggleTask = async (req, res) => {
  try {
    const { id } = req.params

    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single()

    if (fetchError) throw fetchError
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' })

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[PATCH /tasks/:id/toggle]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

/**
 * Elimina una tarea del usuario autenticado.
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    console.error('[DELETE /tasks/:id]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}