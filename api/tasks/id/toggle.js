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
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Método no permitido.' })

  const { error, userId } = await verifyToken(req)
  if (error) return res.status(401).json({ error })

  try {
    const { id } = req.query
    const { data: task, error: fetchError } = await supabase
      .from('tasks').select('completed').eq('id', id).eq('user_id', userId).single()
    if (fetchError) throw fetchError
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' })

    const { data, error: updateError } = await supabase
      .from('tasks').update({ completed: !task.completed })
      .eq('id', id).eq('user_id', userId)
      .select('*, categories(id, name, color, icon)').single()
    if (updateError) throw updateError
    return res.json(data)
  } catch (err) {
    console.error('[PATCH /tasks/:id/toggle]', err.message)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}