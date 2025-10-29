# UTProyex - Frontend y Esquema de Base de Datos

## Descripción General

Este proyecto contiene el frontend completo para **UTProyex**, un repositorio de proyectos para estudiantes universitarios, construido con React, TypeScript y Tailwind CSS. También incluye un diseño detallado del esquema de la base de datos necesario para un backend funcional.

La aplicación simula un entorno completo donde los usuarios pueden registrarse (restringido a un dominio de correo electrónico específico), iniciar sesión, ver una galería de proyectos, subir sus propios trabajos, agregar colaboradores, y comentar en los proyectos de otros.

### Características Principales

- **Autenticación de Usuarios (Simulada):** Flujo de registro e inicio de sesión con validación de dominio de correo (`@utparral.edu.mx`).
- **Galería de Proyectos:** Página principal que muestra todos los proyectos con un sistema de búsqueda y filtrado.
- **Vista de Detalles del Proyecto:** Página dedicada para cada proyecto con descripción completa, archivos, participantes y sección de comentarios.
- **Subida de Proyectos:** Un formulario para que los usuarios suban nuevos proyectos, incluyendo la asignación de colaboradores y la subida de archivos.
- **Integración con IA (Gemini):**
    - **Sello de Originalidad:** Al subir un proyecto, la IA de Gemini analiza la descripción para generar una puntuación de originalidad y una justificación.
    - **Chat de IA por Proyecto:** Un chatbot en la página de cada proyecto que puede responder preguntas sobre el contenido del mismo, basándose en su descripción.
- **Diseño Responsivo:** Interfaz de usuario moderna y adaptable a diferentes tamaños de pantalla gracias a Tailwind CSS.
