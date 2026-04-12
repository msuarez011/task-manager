const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const sanitize = (str) => str.replace(/[<>]/g, '').trim()

const detectPriority = (title) => {
  const text = title.toLowerCase()
  const highPatterns = [
    'urgente', 'urgentemente', 'urgent', 'asap', 'ya mismo', 'ahora mismo',
    'inmediato', 'crítico', 'critico', 'emergencia', 'prioritario',
    'hoy', 'esta noche', 'esta tarde', 'esta mañana', 'ahorita',
    'deadline', 'fecha límite', 'vence hoy', 'vence mañana',
    'entrega hoy', 'entrega mañana', 'para mañana', 'para hoy',
    'médico', 'medico', 'doctor', 'hospital', 'cita médica', 'farmacia',
    'reunión', 'reunion', 'junta', 'presentación', 'presentacion',
    'entrevista', 'cliente', 'jefe', 'jefa', 'gerente', 'informe',
    'pagar', 'factura', 'deuda', 'vencimiento', 'banco', 'impuesto',
    'examen', 'parcial', 'final', 'tesis', 'exposición', 'vuelo'
  ]
  const lowPatterns = [
    'algún día', 'algun dia', 'cuando pueda', 'eventualmente',
    'más adelante', 'mas adelante', 'después', 'despues', 'luego',
    'con calma', 'sin apuro', 'ver película', 'ver serie', 'jugar',
    'leer', 'paseo', 'caminar', 'hobby', 'explorar', 'investigar',
    'quizás', 'quizas', 'tal vez', 'opcional', 'no urgente'
  ]
  if (highPatterns.some(kw => text.includes(kw))) return 'high'
  if (lowPatterns.some(kw => text.includes(kw))) return 'low'
  if (/en \d+ (minuto|hora|dia|día)s?/.test(text)) return 'high'
  return 'medium'
}

async function verifyToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Token no proporcionado.', userId: null }
  }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return { error: 'Token inválido o expirado.', userId: null }
  }
  return { error: null, userId: user.id }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { error, userId } = await verifyToken(req)
  if (error) return res.status(401).json({ error })

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, categories(id, name, color, icon)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return res.json(data)
    } catch (err) {
      console.error('[GET /tasks]', err.message)
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, category_id } = req.body
      if (!title?.trim()) return res.status(400).json({ error: 'El título es obligatorio.' })

      const clean = sanitize(title)
      if (!clean) return res.status(400).json({ error: 'Título inválido.' })
      if (clean.length > 200) return res.status(400).json({ error: 'Máximo 200 caracteres.' })

      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      if (count >= 100) return res.status(429).json({ error: 'Límite de 100 tareas alcanzado.' })

      const priority = detectPriority(clean)
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: clean, priority, user_id: userId, category_id: category_id || null }])
        .select('*, categories(id, name, color, icon)')
        .single()
      if (error) throw error
      return res.status(201).json(data)
    } catch (err) {
      console.error('[POST /tasks]', err.message)
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido.' })
}