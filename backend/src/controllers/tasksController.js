/**
 * @file tasksController.js
 * @description Controlador REST para el recurso Tasks.
 * Filtra tareas por user_id para garantizar privacidad entre usuarios.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import { supabase } from '../config/supabase.js'

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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Crea una nueva tarea asociada al usuario autenticado.
 * @route POST /api/tasks
 * @param {Object} req.body - { title: string, priority?: 'low'|'medium'|'high' }
 */
export const createTask = async (req, res) => {
  try {
    const { title, priority = 'medium' } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio' })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: title.trim(), priority, user_id: req.userId }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Actualiza el estado completed de una tarea del usuario autenticado.
 * @route PATCH /api/tasks/:id
 * @param {Object} req.body - { completed: boolean }
 */
export const toggleTask = async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Tarea no encontrada' })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}