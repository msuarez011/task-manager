/**
 * @file tasks.js
 * @description Define las rutas REST para el recurso Tasks.
 * Todas las rutas están protegidas con authMiddleware.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
  getTasks,
  createTask,
  toggleTask,
  deleteTask
} from '../controllers/tasksController.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id/toggle', toggleTask)
router.delete('/:id', deleteTask)

export default router