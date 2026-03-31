/**
 * @file taskService.js
 * @description Servicio para comunicación con la API del backend.
 * Incluye el token JWT de Supabase en cada petición para autenticación.
 * @author Marcelo Suárez
 * @date 2026-03-31
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://task-manager-production-2c09.up.railway.app/api';

/**
 * Headers base con token de autenticación.
 * @param {string} token - JWT de Supabase
 * @returns {Object} Headers HTTP
 */
const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
})

export async function getTasks(token) {
  const res = await fetch(`${API_URL}/tasks`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
}

export async function createTask(title, priority, token) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ title, priority }),
  });
  if (!res.ok) throw new Error('Error al crear tarea');
  return res.json();
}

export async function toggleTask(id, completed, token) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
}

export async function deleteTask(id, token) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
  if (!res.ok) throw new Error('Error al eliminar tarea');
}