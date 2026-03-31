/**
 * @file tasks.js
 * @description Define las rutas REST para el recurso Tasks
 * y las conecta con sus controladores correspondientes.
 * @author Marcelo Suárez
 * @date 2026-03-30
 */

import express from 'express'
import {
  getTasks,
  createTask,
  toggleTask,
  deleteTask
} from '../controllers/tasksController.js'

const router = express.Router()

router.get('/', getTasks)           // GET    /api/tasks
router.post('/', createTask)        // POST   /api/tasks
router.patch('/:id/toggle', toggleTask) // PATCH  /api/tasks/:id/toggle
router.delete('/:id', deleteTask)   // DELETE /api/tasks/:id

export default router