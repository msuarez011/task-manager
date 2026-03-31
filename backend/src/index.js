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

// Permitir peticiones desde Vercel y localhost
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://task-manager-kappa-tan-53.vercel.app'
  ]
}))

app.use(express.json())
app.use('/api/tasks', taskRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})