/**
 * @file taskService.js
 * @description Servicio para comunicación con la API del backend.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://task-manager-production-2c09.up.railway.app/api';

export async function getTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
}

export async function createTask(title, priority) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority }),
  });
  if (!res.ok) throw new Error('Error al crear tarea');
  return res.json();
}

export async function toggleTask(id, completed) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar tarea');
}