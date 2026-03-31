/**
 * @file vite.config.js
 * @description Configuración de Vite para el frontend del Task Manager.
 *              Define el proxy que redirige las peticiones /api al backend
 *              Express corriendo en el puerto 3000, evitando errores CORS
 *              durante el desarrollo local.
 * @author Marcelo Suárez
 * @version 1.1.0
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    /**
     * @property proxy
     * @description Redirige todas las rutas que empiecen con /api
     *              al servidor Express en localhost:3000.
     *              changeOrigin: true → reescribe el header Origin para evitar rechazos CORS.
     *              secure: false      → permite conexiones sin HTTPS en desarrollo.
     */
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});