/**
 * @file App.jsx
 * @description Componente principal del Task Manager.
 * Integra autenticación Supabase y gestión de tareas por usuario.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import { getTasks, createTask as apiCreateTask, toggleTask as apiToggleTask, deleteTask as apiDeleteTask } from './services/taskService.js'

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

  // Escucha cambios de sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Carga tareas cuando hay sesión activa
  useEffect(() => {
    if (session) fetchTasks()
  }, [session])

  const fetchTasks = async () => {
    try {
      const data = await getTasks(session.access_token)
      setTasks(data)
    } catch {
      setError('No se pudo conectar al servidor.')
    } finally {
      setLoading(false)
    }
  }

  const createTask = async () => {
    if (!title.trim()) return setError('El título no puede estar vacío.')
    if (title.trim().length > 200) return setError('El título no puede superar los 200 caracteres.')
    try {
      setSaving(true)
      setError('')
      await apiCreateTask(title.trim(), priority, session.access_token)
      setTitle('')
      setPriority('medium')
      await fetchTasks()
    } catch {
      setError('Error al crear la tarea.')
    } finally {
      setSaving(false)
    }
  }

  const toggleTask = async (id, completed) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    try {
      await apiToggleTask(id, !completed, session.access_token)
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
      setError('Error al actualizar la tarea.')
    }
  }

  const deleteTask = async (id) => {
    try {
      setError('')
      await apiDeleteTask(id, session.access_token)
      setDeleteId(null)
      await fetchTasks()
    } catch {
      setError('Error al eliminar la tarea.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setTasks([])
  }

  // Si no hay sesión, mostrar Auth
  if (!session) return <Auth />

  const pending   = tasks.filter(t => !t.completed).length
  const completed = tasks.filter(t => t.completed).length

  return (
    <div className="app">
      <div className="card">
        <div className="header">
          <h1>📝 Task Manager</h1>
          <p className="subtitle">Organiza tu día</p>
          <button
            onClick={handleLogout}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: '1px solid #555', color: '#aaa', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
          >
            Cerrar sesión
          </button>
        </div>

        <div className="stats">
          <div className="stat"><span className="stat-number">{tasks.length}</span><span className="stat-label">Total</span></div>
          <div className="stat"><span className="stat-number pending">{pending}</span><span className="stat-label">Pendientes</span></div>
          <div className="stat"><span className="stat-number done">{completed}</span><span className="stat-label">Completadas</span></div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button className="error-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

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
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="priority-select" aria-label="Prioridad">
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Media</option>
            <option value="low">🟢 Baja</option>
          </select>
          <button className="btn-add" onClick={createTask} disabled={saving} aria-label="Agregar tarea">
            {saving ? '...' : '+'}
          </button>
        </div>

        {loading ? (
          <p className="empty">⏳ Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">¡Todo listo por hoy!</p>
            <p className="empty-subtitle">Agrega una tarea para empezar</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <button className="btn-check" onClick={() => toggleTask(task.id, task.completed)}
                  aria-label={task.completed ? 'Marcar pendiente' : 'Marcar completada'}>
                  {task.completed ? '✅' : '⬜'}
                </button>
                <span className="task-title">{task.title}</span>
                <span className="priority-badge" style={{ backgroundColor: PRIORITY_COLORS[task.priority]?.bg || '#ccc' }}>
                  {PRIORITY_COLORS[task.priority]?.label || task.priority}
                </span>
                <button className="btn-delete" onClick={() => setDeleteId(task.id)} aria-label="Eliminar">🗑️</button>
              </li>
            ))}
          </ul>
        )}

        {deleteId && (
          <div className="modal-overlay">
            <div className="modal">
              <p>¿Eliminar esta tarea?</p>
              <div className="modal-actions">
                <button className="btn-confirm" onClick={() => deleteTask(deleteId)}>Sí, eliminar</button>
                <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <p className="footer">Task Manager v1.0</p>
      </div>
    </div>
  )
}

export default App