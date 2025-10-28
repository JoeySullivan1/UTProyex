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

## Esquema de la Base de Datos

El archivo `database_schema.md` contiene la estructura de tablas SQL recomendada para soportar el backend de esta aplicación. El diseño está optimizado para manejar las relaciones entre usuarios, proyectos, participantes, archivos y comentarios de manera eficiente.

## Simulación de Backend

**Importante:** Este paquete de código **no incluye un backend funcional**. Todas las operaciones que requerirían un servidor (como autenticación, guardar datos, subir archivos) están **simuladas en el cliente** utilizando el estado de React y datos de ejemplo.

- La información de usuarios y proyectos se carga desde un archivo de datos estático (`src/data/mockData.ts`).
- Las acciones como "subir proyecto" o "agregar comentario" modifican el estado localmente, pero los cambios no persistirán al recargar la página.
- Las llamadas a la API de Gemini son reales y requieren una clave de API válida.

## Cómo Probar Localmente

Para ejecutar y probar esta aplicación en tu máquina local, sigue estos pasos:

### 1. Requisitos Previos

- **Node.js y npm:** Asegúrate de tener Node.js (versión 18 o superior) y npm instalados.
- **Clave de API de Google Gemini:** Necesitas obtener una clave de API desde [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Configuración del Proyecto

1.  **Descomprimir los Archivos:** Coloca todos los archivos proporcionados en una nueva carpeta de proyecto. Tu estructura debería verse así:
    ```
    mi-proyecto/
    ├── components/
    ├── data/
    ├── pages/
    ├── services/
    ├── App.tsx
    ├── index.html
    ├── index.tsx
    ├── ... (otros archivos)
    ```

2.  **Crear el Archivo de Entorno:** En la raíz de tu proyecto, crea un archivo llamado `.env`.

3.  **Añadir la Clave de API:** Abre el archivo `.env` y añade tu clave de API de Gemini de la siguiente manera:
    ```
    VITE_GEMINI_API_KEY=TU_CLAVE_DE_API_AQUI
    ```
    **Nota:** Debido a que estamos usando Vite para el desarrollo local, las variables de entorno del lado del cliente deben tener el prefijo `VITE_`.

4.  **Actualizar el Código:** En el archivo `src/services/geminiService.ts`, cambia la línea de inicialización de la API para que coincida con el nombre de la variable de entorno:
    ```typescript
    // Cambiar esto:
    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Por esto:
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    ```
    *Este cambio es necesario porque `process.env` no está disponible por defecto en el navegador con Vite. `import.meta.env` es la forma correcta de acceder a las variables de entorno.*

### 3. Instalación y Ejecución

1.  **Abrir la Terminal:** Navega a la carpeta raíz de tu proyecto en la terminal.

2.  **Instalar Dependencias:** Ejecuta el siguiente comando para instalar React y otras librerías necesarias.
    ```bash
    npm install react react-dom @google/genai
    ```
    Para el entorno de desarrollo, también necesitarás Vite y los tipos de TypeScript:
    ```bash
    npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom autoprefixer postcss tailwindcss
    ```
3. **Setup Tailwindcss**: create `tailwind.config.js` and `postcss.config.js` file, follow instruction on [Install Tailwind CSS with Vite](https://tailwindcss.com/docs/guides/vite) to finish setup
4.  **Iniciar el Servidor de Desarrollo:** Una vez instaladas las dependencias, inicia la aplicación:
    ```bash
    npm run dev
    ```

5.  **Abrir en el Navegador:** La terminal te mostrará una URL local (generalmente `http://localhost:5173`). Abre esta URL en tu navegador web para ver e interactuar con la aplicación.