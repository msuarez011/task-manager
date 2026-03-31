/**
 * @file tasksController.js
 * @description Controlador REST para el recurso Tasks.
 * Todas las operaciones filtran por user_id del token JWT.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import { supabase } from '../config/supabase.js'

/**
 * Obtiene todas las tareas del usuario autenticado.
 * @route GET /api/tasks
 * @param {import('express').Request} req - req.userId del middleware
 * @param {import('express').Response} res
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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Crea una nueva tarea asociada al usuario autenticado.
 * @route POST /api/tasks
 * @param {import('express').Request} req - Body: { title, priority }
 * @param {import('express').Response} res
 */
export const createTask = async (req, res) => {
  try {
    const { title, priority = 'medium' } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'Máximo 200 caracteres.' })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: title.trim(),
        priority,
        user_id: req.userId
      }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Invierte el estado completed de una tarea del usuario.
 * @route PATCH /api/tasks/:id/toggle
 * @param {import('express').Request} req - Params: { id }
 * @param {import('express').Response} res
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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Elimina una tarea del usuario autenticado.
 * @route DELETE /api/tasks/:id
 * @param {import('express').Request} req - Params: { id }
 * @param {import('express').Response} res
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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}