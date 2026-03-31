/**
 * @file App.jsx
 * @description Componente principal del Task Manager.
 * Gestiona autenticación con Supabase Auth y operaciones CRUD de tareas.
 * Las rutas están protegidas — solo usuarios autenticados acceden a las tareas.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import { useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL + '/tasks'

/**
 * Colores y etiquetas asociados a cada nivel de prioridad.
 */
const PRIORITY_COLORS = {
  high:   { bg: '#ff6b6b', label: 'Alta' },
  medium: { bg: '#ffd93d', label: 'Media' },
  low:    { bg: '#6bcb77', label: 'Baja' }
}

function App() {
  const [session, setSession]   = useState(null)
  const [tasks, setTasks]       = useState([])
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [deleteId, setDeleteId] = useState(null)

  // Escuchar cambios de sesión de Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Cargar tareas cuando hay sesión activa
  useEffect(() => {
    if (session) fetchTasks()
  }, [session])

  /**
   * Obtiene el token JWT del usuario actual para autorizar peticiones al backend.
   * @returns {Promise<string>} Token JWT
   */
  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${session.access_token}` }
  }

  /**
   * Obtiene todas las tareas del usuario autenticado.
   */
  const fetchTasks = async () => {
    try {
      const headers = await getAuthHeader()
      const response = await axios.get(API_URL, { headers })
      setTasks(response.data)
    } catch {
      setError('No se pudo conectar al servidor.')
    }
  }

  /**
   * Crea una nueva tarea con título y prioridad.
   */
  const createTask = async () => {
    if (!title.trim()) return setError('El título no puede estar vacío.')
    if (title.trim().length > 200) return setError('Máximo 200 caracteres.')

    try {
      setSaving(true)
      setError('')
      const headers = await getAuthHeader()
      await axios.post(API_URL, { title: title.trim(), priority }, { headers })
      setTitle('')
      setPriority('medium')
      await fetchTasks()
    } catch {
      setError('Error al crear la tarea.')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Invierte el estado completed con optimistic update.
   * @param {string} id - UUID de la tarea
   */
  const toggleTask = async (id) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    )
    try {
      const headers = await getAuthHeader()
      await axios.patch(`${API_URL}/${id}/toggle`, {}, { headers })
    } catch {
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      )
      setError('Error al actualizar la tarea.')
    }
  }

  /**
   * Elimina una tarea tras confirmación.
   * @param {string} id - UUID de la tarea
   */
  const deleteTask = async (id) => {
    try {
      setError('')
      const headers = await getAuthHeader()
      await axios.delete(`${API_URL}/${id}`, { headers })
      setDeleteId(null)
      await fetchTasks()
    } catch {
      setError('Error al eliminar la tarea.')
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setTasks([])
  }

  const pending   = tasks.filter(t => !t.completed).length
  const completed = tasks.filter(t => t.completed).length

  // Mostrar pantalla de carga inicial
  if (loading) return (
    <div className="app">
      <div className="card">
        <p className="empty">⏳ Cargando...</p>
      </div>
    </div>
  )

  // Mostrar Auth si no hay sesión
  if (!session) return <Auth />

  return (
    <div className="app">
      <div className="card">

        {/* Header con botón de logout */}
        <div className="header">
          <h1>📝 Task Manager</h1>
          <p className="subtitle">Organiza tu día</p>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>

        {/* Contador */}
        <div className="stats">
          <div className="stat">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-number pending">{pending}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat">
            <span className="stat-number done">{completed}</span>
            <span className="stat-label">Completadas</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button className="error-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Input nueva tarea */}
        <div className="input-group">
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={title}
            maxLength={200}
            onChange={(e) => { setTitle(e.target.value); if (error) setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && !saving && createTask()}
            aria-label="Nueva tarea"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
            aria-label="Prioridad"
          >
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Media</option>
            <option value="low">🟢 Baja</option>
          </select>
          <button
            className="btn-add"
            onClick={createTask}
            disabled={saving}
            aria-label="Agregar tarea"
          >
            {saving ? '...' : '+'}
          </button>
        </div>

        {/* Lista de tareas */}
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎉</p>
            <p className="empty-title">¡Todo listo por hoy!</p>
            <p className="empty-subtitle">Agrega una tarea para empezar</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <button
                  className="btn-check"
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? 'Marcar pendiente' : 'Marcar completada'}
                >
                  {task.completed ? '✅' : '⬜'}
                </button>
                <span className="task-title">{task.title}</span>
                <span
                  className="priority-badge"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority]?.bg || '#ccc' }}
                >
                  {PRIORITY_COLORS[task.priority]?.label || task.priority}
                </span>
                <button
                  className="btn-delete"
                  onClick={() => setDeleteId(task.id)}
                  aria-label="Eliminar tarea"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Modal confirmación */}
        {deleteId && (
          <div className="modal-overlay">
            <div className="modal">
              <p>¿Eliminar esta tarea?</p>
              <div className="modal-actions">
                <button className="btn-confirm" onClick={() => deleteTask(deleteId)}>
                  Sí, eliminar
                </button>
                <button className="btn-cancel" onClick={() => setDeleteId(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="footer">Task Manager v1.0 — Mi portafolio</p>
      </div>
    </div>
  )
}

export default App