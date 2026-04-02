/**
 * @file App.jsx
 * @description Componente principal del Task Manager.
 * Usa lucide-react para iconos profesionales.
 * Detección automática de prioridad en el backend.
 * @author Marcelo Suárez
 * @date 2026-04-01
 */

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CheckSquare, Square, Trash2, Plus, LogOut,
  AlertCircle, AlertTriangle, CheckCircle2,
  ClipboardList, Loader2
} from 'lucide-react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL + '/tasks'

const PRIORITIES = {
  high:   { label: 'Alta',  color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', Icon: AlertCircle },
  medium: { label: 'Media', color: '#ffd93d', bg: 'rgba(255,217,61,0.12)',  Icon: AlertTriangle },
  low:    { label: 'Baja',  color: '#6bcb77', bg: 'rgba(107,203,119,0.12)', Icon: CheckCircle2 }
}

function App() {
  const [session, setSession]   = useState(null)
  const [tasks, setTasks]       = useState([])
  const [title, setTitle]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [deleteId, setDeleteId] = useState(null)

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

  useEffect(() => {
    if (session) fetchTasks()
  }, [session])

  /**
   * Obtiene el header de autorización JWT.
   */
  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${session.access_token}` }
  }

  /**
   * Obtiene todas las tareas del usuario.
   */
  const fetchTasks = async () => {
    try {
      const headers = await getAuthHeader()
      const response = await axios.get(API_URL, { headers, timeout: 30000 })
      setTasks(response.data)
    } catch {
      setError('No se pudo conectar al servidor.')
    }
  }

  /**
   * Crea una nueva tarea — la prioridad se detecta automáticamente en el backend.
   */
  const createTask = async () => {
    if (!title.trim()) return setError('El título no puede estar vacío.')
    if (title.trim().length > 200) return setError('Máximo 200 caracteres.')
    try {
      setSaving(true)
      setError('')
      const headers = await getAuthHeader()
      await axios.post(API_URL, { title: title.trim() }, { headers, timeout: 30000 })
      setTitle('')
      await fetchTasks()
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('El servidor está iniciando, intenta de nuevo en unos segundos.')
      } else {
        setError('Error al crear la tarea.')
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * Invierte el estado completed con optimistic update.
   */
  const toggleTask = async (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    try {
      const headers = await getAuthHeader()
      await axios.patch(`${API_URL}/${id}/toggle`, {}, { headers, timeout: 30000 })
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      setError('Error al actualizar la tarea.')
    }
  }

  /**
   * Elimina una tarea tras confirmación.
   */
  const deleteTask = async (id) => {
    try {
      setError('')
      const headers = await getAuthHeader()
      await axios.delete(`${API_URL}/${id}`, { headers, timeout: 30000 })
      setDeleteId(null)
      await fetchTasks()
    } catch {
      setError('Error al eliminar la tarea.')
    }
  }

  /**
   * Cierra la sesión del usuario.
   */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setTasks([])
  }

  const pending   = tasks.filter(t => !t.completed).length
  const completed = tasks.filter(t => t.completed).length

  if (loading) return (
    <div className="app">
      <div className="card">
        <p className="empty">
          <Loader2 size={20} className="spin" /> Cargando...
        </p>
      </div>
    </div>
  )

  if (!session) return <Auth />

  return (
    <div className="app">
      <div className="card">

        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div className="header-title">
              <ClipboardList size={24} color="#7c3aed" />
              <h1>Task Manager</h1>
            </div>
            <button className="btn-logout" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
          <p className="subtitle">Organiza tu día</p>
        </div>

        {/* Stats */}
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
            <AlertCircle size={16} />
            {error}
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
          <button
            className="btn-add"
            onClick={createTask}
            disabled={saving}
            aria-label="Agregar tarea"
          >
            {saving ? <Loader2 size={20} className="spin" /> : <Plus size={20} />}
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
            {tasks.map(task => {
              const p = PRIORITIES[task.priority] || PRIORITIES.medium
              const PIcon = p.Icon
              return (
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <button
                    className="btn-check"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Marcar pendiente' : 'Marcar completada'}
                  >
                    {task.completed
                      ? <CheckSquare size={20} color="#10b981" />
                      : <Square size={20} color="#64748b" />}
                  </button>

                  <span className="task-title">{task.title}</span>

                  <span className="priority-badge" style={{ color: p.color, background: p.bg }}>
                    <PIcon size={12} />
                    {p.label}
                  </span>

                  <button
                    className="btn-delete"
                    onClick={() => setDeleteId(task.id)}
                    aria-label="Eliminar tarea"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* Modal confirmación */}
        {deleteId && (
          <div className="modal-overlay">
            <div className="modal">
              <Trash2 size={32} color="#ef4444" style={{ margin: '0 auto 12px' }} />
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
