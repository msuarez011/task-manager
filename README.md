# 🗂️ Task Manager

Aplicación web fullstack para gestión de tareas personales con arquitectura backend/frontend separada, desplegada en producción.

[![Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel)](https://task-manager-kappa-tan-53.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-131415?style=for-the-badge&logo=railway)](https://task-manager-production-2c09.up.railway.app)

---

## ✨ Funcionalidades

- ✅ Crear, completar y eliminar tareas
- 🎯 Prioridades: Alta / Media / Baja con badges visuales
- ⚡ Optimistic updates — respuesta instantánea sin esperar al servidor
- 🗑️ Modal de confirmación antes de eliminar
- 🔒 Validaciones: campo vacío, límite de 200 caracteres, error de conexión
- 📱 Diseño responsive con glassmorphism

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |
| Documentación | JSDoc |

---

## 📁 Estructura del Proyecto
```
task-manager/
├── frontend/          # React + Vite
│   └── src/
│       ├── App.jsx
│       └── App.css
└── backend/           # Node.js + Express
    └── src/
        ├── index.js
        ├── config/
        │   └── supabase.js
        ├── controllers/
        │   └── tasksController.js
        └── routes/
            └── tasks.js
```

---

## 🚀 Instalación local

### Requisitos
- Node.js v18+
- Cuenta en [Supabase](https://supabase.com)

### Backend
```bash
cd backend
npm install
```
Crea un archivo `.env`:
```env
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_clave
PORT=3000
```
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Base de datos

Tabla `tasks` en Supabase (PostgreSQL):
```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  completed boolean default false,
  priority text default 'Media',
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/tasks` | Obtener todas las tareas |
| POST | `/api/tasks` | Crear nueva tarea |
| PATCH | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

---

## 👨‍💻 Autor

**Marcelo Suárez Paz**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/marcelo1243)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github)](https://github.com/msuarez011)
