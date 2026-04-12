const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function verifyToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return { error: 'Token no proporcionado.', userId: null }
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { error: 'Token inválido o expirado.', userId: null }
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
        .from('categories').select('*')
        .eq('user_id', userId).order('created_at', { ascending: true })
      if (error) throw error
      return res.json(data)
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, color = '#7C3AED', icon = '📌' } = req.body
      if (!name?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio.' })
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim(), color, icon, user_id: userId }])
        .select().single()
      if (error) throw error
      return res.status(201).json(data)
    } catch (err) {
      return res.status(500).json({ error: 'Error interno del servidor.' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido.' })
}