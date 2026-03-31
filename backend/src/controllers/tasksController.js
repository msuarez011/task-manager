/**
 * @file tasksController.js
 * @description Controlador REST para el recurso Tasks.
 * Maneja las operaciones CRUD usando Supabase como base de datos.
 * @author Marcelo Suárez
 * @date 2026-03-30
 */

import { supabase } from '../config/supabase.js'

/**
 * Obtiene todas las tareas ordenadas por fecha de creación descendente.
 * @route GET /api/tasks
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Array} Lista de tareas
 */
export const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Crea una nueva tarea en la base de datos.
 * @route POST /api/tasks
 * @param {import('express').Request} req - Body: { title: string, priority?: 'low'|'medium'|'high' }
 * @param {import('express').Response} res
 * @returns {Object} Tarea creada
 * @throws {400} Si el título está vacío
 */
export const createTask = async (req, res) => {
  try {
    const { title, priority = 'medium' } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio' })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: title.trim(), priority }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Invierte el estado completed de una tarea (toggle).
 * @route PATCH /api/tasks/:id/toggle
 * @param {import('express').Request} req - Params: { id: UUID }
 * @param {import('express').Response} res
 * @returns {Object} Tarea actualizada
 * @throws {404} Si la tarea no existe
 */
export const toggleTask = async (req, res) => {
  try {
    const { id } = req.params

    // Consulta previa para obtener el estado actual antes de invertirlo
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * Elimina una tarea por su ID.
 * @route DELETE /api/tasks/:id
 * @param {import('express').Request} req - Params: { id: UUID }
 * @param {import('express').Response} res
 * @returns {204} Sin contenido si fue exitoso
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
