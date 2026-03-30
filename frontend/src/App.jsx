import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:3000/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const response = await axios.get(API_URL)
    setTasks(response.data)
    setLoading(false)
  }

  const createTask = async () => {
    if (!title.trim()) return
    await axios.post(API_URL, { title })
    setTitle('')
    fetchTasks()
  }

  const toggleTask = async (id) => {
    await axios.patch(`${API_URL}/${id}/toggle`)
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`)
    fetchTasks()
  }

  const pending = tasks.filter(t => !t.completed).length
  const completed = tasks.filter(t => t.completed).length

  return (
    <div className="app">
      <div className="card">

        {/* Header */}
        <div className="header">
          <h1>📝 Task Manager</h1>
          <p className="subtitle">Organiza tu día</p>
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

        {/* Input */}
        <div className="input-group">
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTask()}
          />
          <button className="btn-add" onClick={createTask}>+</button>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="empty">Cargando tareas...</p>
        ) : tasks.length === 0 ? (
          <p className="empty">🎉 ¡Sin tareas pendientes!</p>
        ) : (
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <button
                  className="btn-check"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? '✅' : '⬜'}
                </button>
                <span className="task-title">{task.title}</span>
                <button
                  className="btn-delete"
                  onClick={() => deleteTask(task.id)}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <p className="footer">Task Manager v1.0 — Mi portafolio</p>

      </div>
    </div>
  )
}

export default App