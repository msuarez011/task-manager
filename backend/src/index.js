/**
 * @file index.js
 * @description Punto de entrada del servidor Express.
 * Configura middlewares de seguridad, rutas y levanta el servidor HTTP.
 * Incluye Helmet.js para headers seguros y rate limiting contra fuerza bruta.
 * @author Marcelo Suárez
 * @date 2026-04-02
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import taskRoutes from './routes/tasks.js'

const app = express()
const PORT = process.env.PORT || 3000

// Headers de seguridad HTTP
app.use(helmet())

// CORS — solo dominios autorizados
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://task-manager-kappa-tan-53.vercel.app'
  ]
}))

// Rate limiting — máx 100 peticiones por IP cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' }
})

// Endpoint de health check para keep-alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/', limiter)
app.use(express.json())
app.use('/api/tasks', taskRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})