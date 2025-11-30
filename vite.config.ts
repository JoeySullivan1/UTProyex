import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
      'utproyex.ddns.net',
      'utproyex.net',
      'utproyex.site',
      'utproyex.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
    https: {
      // Ajusta la ruta si moviste la carpeta, pero según tus mensajes anteriores es esta:
      key: fs.readFileSync('A:/Archivos/Documentos/Tareas/UTP/BackEnd/certs/privkey.pem'),
      cert: fs.readFileSync('A:/Archivos/Documentos/Tareas/UTP/BackEnd/certs/fullchain.pem'),
    }
    
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
