/**
 * @file tasks.js
 * @description Define las rutas REST para el recurso Tasks.
 * Todas las rutas están protegidas por authMiddleware.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import express from 'express'
import { getTasks, createTask, toggleTask, deleteTask } from '../controllers/tasksController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware) // Protege todas las rutas

router.get('/',     getTasks)           // GET    /api/tasks
router.post('/',    createTask)         // POST   /api/tasks
router.patch('/:id', toggleTask)        // PATCH  /api/tasks/:id
router.delete('/:id', deleteTask)       // DELETE /api/tasks/:id

export default router