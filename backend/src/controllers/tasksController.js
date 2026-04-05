/**
 * Detecta automáticamente la prioridad de una tarea según su título.
 * Sistema mejorado con más keywords en español, patrones contextuales
 * y pesos por categoría para mayor precisión.
 * @param {string} title - Título de la tarea
 * @returns {'high'|'medium'|'low'} Prioridad detectada
 */
const detectPriority = (title) => {
  const text = title.toLowerCase()

  const highPatterns = [
    'urgente', 'urgentemente', 'urgent', 'asap', 'ya mismo', 'ahora mismo',
    'inmediato', 'inmediatamente', 'crítico', 'critico', 'critical',
    'emergencia', 'emergente', 'prioritario', 'prioritaria',
    'hoy', 'esta noche', 'esta tarde', 'esta mañana', 'ahorita',
    'deadline', 'fecha límite', 'fecha limite', 'vence hoy', 'vence mañana',
    'entrega hoy', 'entrega mañana', 'para mañana', 'para hoy',
    'médico', 'medico', 'doctor', 'doctora', 'hospital', 'clínica', 'clinica',
    'cita médica', 'cita medica', 'farmacia', 'medicamento', 'medicina',
    'dolor', 'enfermo', 'enferma',
    'reunión', 'reunion', 'junta', 'presentación', 'presentacion',
    'entrevista', 'cliente', 'jefe', 'jefa', 'gerente', 'director',
    'informe', 'reporte', 'propuesta', 'contrato', 'firma',
    'llamada importante', 'videoconferencia', 'zoom', 'meet',
    'pagar', 'pago', 'factura', 'deuda', 'vencimiento', 'cobro',
    'transferencia', 'banco', 'tarjeta', 'impuesto', 'multa', 'mora',
    'examen', 'parcial', 'final', 'tesis', 'sustentación', 'sustentacion',
    'exposición', 'exposicion', 'entrega de proyecto',
    'boda', 'funeral', 'vuelo', 'aeropuerto', 'cumpleaños hoy', 'evento hoy'
  ]

  const lowPatterns = [
    'algún día', 'algun dia', 'cuando pueda', 'cuando tenga tiempo',
    'a futuro', 'en algún momento', 'eventualmente', 'más adelante',
    'mas adelante', 'después', 'despues', 'luego', 'un día', 'un dia',
    'tarde o temprano', 'con calma', 'sin apuro', 'sin prisa',
    'ver película', 'ver pelicula', 'ver serie', 'ver anime',
    'jugar', 'videojuego', 'netflix', 'spotify', 'youtube',
    'leer libro', 'leer novela', 'manga', 'comic', 'cómic',
    'paseo', 'caminata', 'caminar', 'pasear', 'relajar', 'descansar',
    'hobby', 'manualidad', 'dibujar', 'pintar', 'tejer',
    'explorar', 'investigar', 'aprender sobre', 'curiosidad',
    'probar', 'intentar', 'considerar', 'pensar en', 'evaluar',
    'quizás', 'quizas', 'tal vez', 'puede ser', 'si tengo tiempo',
    'opcional', 'no urgente', 'baja prioridad',
    'ver tiendas', 'buscar en amazon', 'wishlist', 'lista de deseos',
    'comparar precios', 'buscar ofertas',
    'reorganizar', 'decorar', 'rediseñar', 'redisenar'
  ]

  const highMatches = highPatterns.filter(kw => text.includes(kw)).length
  const lowMatches  = lowPatterns.filter(kw => text.includes(kw)).length

  if (highMatches > 0) return 'high'
  if (lowMatches > 0)  return 'low'

  if (/en \d+ (minuto|hora|dia|día)s?/.test(text)) return 'high'
  if (/(terminando|acabando|completando|enviando|entregando)/.test(text)) return 'high'

  return 'medium'
}

/**
 * Obtiene todas las tareas del usuario autenticado.
 * @route GET /api/tasks
 */
export const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[GET /tasks]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

/**
 * Crea una nueva tarea asociada al usuario autenticado.
 * Límite máximo de 100 tareas por usuario.
 * @route POST /api/tasks
 */
export const createTask = async (req, res) => {
  try {
    const raw = req.body.title
    if (!raw || raw.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio.' })
    }

    const title = sanitize(raw)

    if (title.length === 0) {
      return res.status(400).json({ error: 'El título contiene caracteres no válidos.' })
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Máximo 200 caracteres.' })
    }

    // Verificar límite de tareas por usuario
    const { count, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)

    if (countError) throw countError

    if (count >= 100) {
      return res.status(429).json({ error: 'Límite de 100 tareas alcanzado. Elimina algunas para continuar.' })
    }

    const priority = detectPriority(title)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, priority, user_id: req.userId }])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('[POST /tasks]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

/**
 * Invierte el estado completed de una tarea del usuario.
 * @route PATCH /api/tasks/:id/toggle
 */
export const toggleTask = async (req, res) => {
  try {
    const { id } = req.params

    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single()

    if (fetchError) throw fetchError
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' })

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('[PATCH /tasks/:id/toggle]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}

/**
 * Elimina una tarea del usuario autenticado.
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    console.error('[DELETE /tasks/:id]', err.message)
    res.status(500).json({ error: 'Error interno del servidor.' })
  }
}