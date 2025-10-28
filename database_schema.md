# Esquema de Base de Datos para UTProyex

Este documento describe la estructura óptima de la base de datos para la aplicación de repositorio de proyectos. El esquema está diseñado en SQL y es compatible con sistemas de gestión de bases de datos relacionales como PostgreSQL o MySQL.

## Diagrama de Relaciones (Conceptual)

```
[users] 1--* [projects]
[users] *--* [projects] (a través de project_participants)
[projects] 1--* [project_files]
[projects] 1--* [comments]
[users] 1--* [comments]
```

---

## Tablas

### 1. `users`

Almacena la información de los usuarios registrados en la plataforma.

- **`id`**: `UUID` - Clave primaria. Un identificador único universal para cada usuario.
- **`full_name`**: `VARCHAR(255)` - Nombre completo del usuario.
- **`email`**: `VARCHAR(255)` - Correo electrónico del usuario. Debe ser único y se debe aplicar una restricción (`CHECK`) para que termine en `@utparral.edu.mx`.
- **`password_hash`**: `VARCHAR(255)` - Hash de la contraseña del usuario (nunca almacenar contraseñas en texto plano).
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` - Fecha y hora de creación de la cuenta, por defecto el tiempo actual.
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` - Fecha y hora de la última actualización del perfil.

**SQL de Ejemplo (PostgreSQL):**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_email_domain CHECK (email LIKE '%@utparral.edu.mx')
);
```

---

### 2. `projects`

Contiene la información principal de cada proyecto subido a la plataforma.

- **`id`**: `UUID` - Clave primaria.
- **`title`**: `VARCHAR(255)` - Título del proyecto.
- **`description`**: `TEXT` - Descripción detallada del proyecto.
- **`category`**: `VARCHAR(100)` - Categoría del proyecto (ej. "Software", "Mecatrónica", "Energías Renovables").
- **`owner_id`**: `UUID` - Clave foránea que referencia a `users(id)`. Identifica al usuario que subió el proyecto.
- **`originality_score`**: `INTEGER` - Puntuación de 0 a 100 generada por la IA.
- **`originality_justification`**: `TEXT` - Justificación de la puntuación de originalidad, proporcionada por la IA.
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` - Fecha de subida.
- **`updated_at`**: `TIMESTAMP WITH TIME ZONE` - Fecha de última modificación.

**SQL de Ejemplo (PostgreSQL):**
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    originality_score INTEGER,
    originality_justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 3. `project_participants`

Tabla de unión (junction table) para gestionar la relación de muchos a muchos entre usuarios y proyectos. Permite que un proyecto tenga múltiples participantes y que un usuario participe en múltiples proyectos.

- **`project_id`**: `UUID` - Clave foránea que referencia a `projects(id)`.
- **`user_id`**: `UUID` - Clave foránea que referencia a `users(id)`.
- **`role`**: `VARCHAR(50)` - Rol del participante (ej. "Líder", "Colaborador"), opcional.
- **Clave Primaria Compuesta**: `(project_id, user_id)` para asegurar que un usuario no pueda ser agregado dos veces al mismo proyecto.

**SQL de Ejemplo (PostgreSQL):**
```sql
CREATE TABLE project_participants (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Colaborador',
    PRIMARY KEY (project_id, user_id)
);
```

---

### 4. `project_files`

Almacena referencias a los archivos asociados a cada proyecto.

- **`id`**: `UUID` - Clave primaria.
- **`project_id`**: `UUID` - Clave foránea que referencia a `projects(id)`.
- **`file_name`**: `VARCHAR(255)` - Nombre original del archivo.
- **`file_url`**: `VARCHAR(1024)` - URL al archivo almacenado en un servicio de almacenamiento en la nube (como AWS S3, Google Cloud Storage, etc.).
- **`file_type`**: `VARCHAR(100)` - Tipo MIME del archivo (ej. `application/pdf`, `image/jpeg`).
- **`uploaded_at`**: `TIMESTAMP WITH TIME ZONE` - Fecha de subida del archivo.

**SQL de Ejemplo (PostgreSQL):**
```sql
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5. `comments`

Guarda los comentarios hechos por los usuarios en los proyectos.

- **`id`**: `UUID` - Clave primaria.
- **`project_id`**: `UUID` - Clave foránea que referencia a `projects(id)`.
- **`user_id`**: `UUID` - Clave foránea que referencia a `users(id)`.
- **`content`**: `TEXT` - El texto del comentario.
- **`created_at`**: `TIMESTAMP WITH TIME ZONE` - Fecha en que se publicó el comentario.

**SQL de Ejemplo (PostgreSQL):**
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```