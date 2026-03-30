let tasks = [
    { id: 1, title: 'Aprender Node.js', completed: false },
    { id: 2, title: 'Crear mi portafolio', completed: false },
  ]
  
  const getTasks = (req, res) => {
    res.json(tasks)
  }
  
  const createTask = (req, res) => {
    const { title } = req.body
    if (!title) return res.status(400).json({ error: 'El título es obligatorio' })
  
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    }
    tasks.push(newTask)
    res.status(201).json(newTask)
  }
  
  const toggleTask = (req, res) => {
    const { id } = req.params
    const task = tasks.find(t => t.id === parseInt(id))
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' })
  
    task.completed = !task.completed
    res.json(task)
  }
  
  const deleteTask = (req, res) => {
    const { id } = req.params
    const index = tasks.findIndex(t => t.id === parseInt(id))
    if (index === -1) return res.status(404).json({ error: 'Tarea no encontrada' })
  
    tasks.splice(index, 1)
    res.json({ message: 'Tarea eliminada correctamente' })
  }
  
  module.exports = { getTasks, createTask, toggleTask, deleteTask }