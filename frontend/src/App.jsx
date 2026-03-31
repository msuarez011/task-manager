/**
 * @file App.jsx
 * @description Componente principal del Task Manager.
 * Gestiona el estado global de tareas, interacciones con la API
 * y renderiza la interfaz completa de la aplicación.
 * Implementa optimistic updates para respuesta visual instantánea.
 * @author Marcelo Suárez
 * @date 2026-03-30
 */

import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'https://task-manager-production-2c09.up.railway.app'

/**
 * Colores y etiquetas asociados a cada nivel de prioridad.
 * Usados para el badge visual en cada tarea.
 */
const PRIORITY_COLORS = {
  high:   { bg: '#ff6b6b', label: 'Alta' },
  medium: { bg: '#ffd93d', label: 'Media' },
  low:    { bg: '#6bcb77', label: 'Baja' }
}

/**
 * Componente raíz de la aplicación.
 * Maneja CRUD de tareas contra la API REST del backend.
 * @returns {JSX.Element}
 */
function App() {
  const [tasks, setTasks]       = useState([])
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  /**
   * Obtiene todas las tareas desde la API y actualiza el estado.
   * Maneja el estado de carga y errores de red.
   */
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL)
      setTasks(response.data)
    } catch {
      setError('No se pudo conectar al servidor. Verifica que el backend esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Crea una nueva tarea con el título y prioridad seleccionados.
   * Valida que el título no esté vacío ni supere 200 caracteres.
   */
  const createTask = async () => {
    if (!title.trim()) {
      setError('El título no puede estar vacío.')
      return
    }

    if (title.trim().length > 200) {
      setError('El título no puede superar los 200 caracteres.')
      return
    }

    try {
      setSaving(true)
      setError('')
      await axios.post(API_URL, { title: title.trim(), priority })
      setTitle('')
      setPriority('medium')
      await fetchTasks()
    } catch {
      setError('Error al crear la tarea. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Invierte el estado completed de una tarea con actualización optimista.
   * Actualiza la UI inmediatamente sin esperar respuesta del servidor.
   * Si la API falla, revierte el cambio al estado anterior.
   * @param {string} id - UUID de la tarea
   */
  const toggleTask = async (id) => {
    // Actualizar UI inmediatamente sin esperar la API
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    )

    try {
      await axios.patch(`${API_URL}/${id}/toggle`)
    } catch {
      // Revertir si la API falla
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      )
      setError('Error al actualizar la tarea.')
    }
  }

  /**
   * Elimina una tarea tras confirmación del usuario.
   * Usa el estado deleteId como modal de confirmación liviano.
   * @param {string} id - UUID de la tarea a eliminar
   */
  const deleteTask = async (id) => {
    try {
      setError('')
      await axios.delete(`${API_URL}/${id}`)
      setDeleteId(null)
      await fetchTasks()
    } catch {
      setError('Error al eliminar la tarea.')
    }
  }

  const pending   = tasks.filter(t => !t.completed).length
  const completed = tasks.filter(t => t.completed).length

  return (
    <div className="app">
      <div className="card">

        {/* Header */}
        <div className="header">
          <h1>📝 Task Manager</h1>
          <p className="subtitle">Organiza tu día</p>
        </div>

        {/* Contador de estadísticas */}
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

        {/* Mensaje de error global con botón de cierre */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button className="error-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Input de nueva tarea + selector de prioridad */}
        <div className="input-group">
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={title}
            maxLength={200}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && !saving && createTask()}
            aria-label="Nueva tarea"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
            aria-label="Prioridad de la tarea"
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

        {/* Lista de tareas / estados de carga y vacío */}
        {loading ? (
          <p className="empty">⏳ Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎉</p>
            <p className="empty-title">¡Todo listo por hoy!</p>
            <p className="empty-subtitle">Agrega una tarea para empezar</p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                {/* Toggle completado */}
                <button
                  className="btn-check"
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {task.completed ? '✅' : '⬜'}
                </button>

                {/* Título de la tarea */}
                <span className="task-title">{task.title}</span>

                {/* Badge visual de prioridad */}
                <span
                  className="priority-badge"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority]?.bg || '#ccc' }}
                >
                  {PRIORITY_COLORS[task.priority]?.label || task.priority}
                </span>

                {/* Botón eliminar — abre modal de confirmación */}
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

        {/* Modal de confirmación antes de eliminar */}
        {deleteId && (
          <div className="modal-overlay">
            <div className="modal">
              <p>¿Eliminar esta tarea?</p>
              <div className="modal-actions">
                <button
                  className="btn-confirm"
                  onClick={() => deleteTask(deleteId)}
                >
                  Sí, eliminar
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setDeleteId(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="footer">Task Manager v1.0</p>

      </div>
    </div>
  )
}

export default App