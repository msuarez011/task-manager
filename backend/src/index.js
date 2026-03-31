/**
 * @file index.js
 * @description Punto de entrada del servidor Express.
 * Configura middlewares, rutas y levanta el servidor HTTP.
 * @author Marcelo Suárez
 * @date 2026-03-30
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import taskRoutes from './routes/tasks.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/tasks', taskRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})