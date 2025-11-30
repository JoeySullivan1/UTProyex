const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

// --- CONFIGURACIÓN ---
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- CONEXIÓN DB ---
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'utproyex',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión al iniciar
pool.getConnection()
    .then(conn => {
        console.log("✅ BD Conectada exitosamente");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Error conectando a BD:", err.message);
    });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'proyectos');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueSuffix + '-' + cleanName);
    }
});
const upload = multer({ storage: storage });
app.use('/proyectos', express.static(path.join(__dirname, 'public', 'proyectos')));

// ==========================================
// RUTAS PRINCIPALES
// ==========================================

// 1. OBTENER TODOS LOS PROYECTOS (HOME FEED)
app.get('/api/projects', async (req, res) => {
    console.log("📡 Petición recibida: GET /api/projects");
    try {
        // 1. Obtener los proyectos básicos
        const query = `
            SELECT p.id, p.title, p.description, p.category, p.created_at, 
                   p.originality_score, p.progress,
                   u.id as owner_id, u.full_name as owner_name, u.email as owner_email
            FROM projects p
            JOIN users u ON p.owner_id = u.id
            ORDER BY p.created_at DESC
        `;
        const [rows] = await pool.query(query);

        // 2. [CORRECCIÓN] Iteramos sobre cada proyecto para buscar sus participantes
        // Usamos Promise.all para esperar a que todas las sub-consultas terminen
        const projectsWithParticipants = await Promise.all(rows.map(async (row) => {
            // Buscamos los participantes de ESTE proyecto específico
            const [parts] = await pool.query(`
                SELECT u.id, u.full_name as fullName 
                FROM project_participants pp 
                JOIN users u ON pp.user_id = u.id 
                WHERE pp.project_id = ?
            `, [row.id]);

            return {
                id: row.id,
                title: row.title,
                description: row.description,
                category: row.category,
                createdAt: row.created_at,
                originalityScore: row.originality_score,
                progress: row.progress,
                owner: { id: row.owner_id, fullName: row.owner_name, email: row.owner_email },
                participants: parts, // <--- AHORA SÍ ENVIAMOS LA LISTA REAL
                files: [],
                comments: []
            };
        }));

        console.log(`✅ Enviando ${projectsWithParticipants.length} proyectos con participantes`);
        res.json(projectsWithParticipants);

    } catch (error) {
        console.error("❌ Error en GET /api/projects:", error);
        res.status(500).json({ message: 'Error al cargar proyectos' });
    }
});


// 2. OBTENER PROYECTO POR ID
app.get('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [pRows] = await pool.query(`
            SELECT p.*, u.id as owner_uid, u.full_name as owner_name, u.email as owner_email 
            FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.id = ?`, [id]);
        
        if (pRows.length === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
        const p = pRows[0];

        const [files] = await pool.query('SELECT * FROM project_files WHERE project_id = ?', [id]);
        const [parts] = await pool.query(`SELECT u.id, u.full_name, u.email FROM project_participants pp JOIN users u ON pp.user_id = u.id WHERE pp.project_id = ?`, [id]);
        const [comments] = await pool.query(`SELECT c.id, c.content, c.created_at, u.id as user_id, u.full_name, u.email FROM comments c JOIN users u ON c.user_id = u.id WHERE c.project_id = ? ORDER BY c.created_at ASC`, [id]);

        res.json({
            id: p.id, title: p.title, description: p.description, category: p.category, createdAt: p.created_at,
            originalityScore: p.originality_score, originalityJustification: p.originality_justification,
            progress: p.progress,
            owner: { id: p.owner_uid, fullName: p.owner_name, email: p.owner_email },
            files: files.map(f => ({ id: f.id, name: f.file_name, url: f.file_url, type: f.file_type })),
            participants: parts.map(u => ({ id: u.id, fullName: u.full_name, email: u.email })),
            comments: comments.map(c => ({ id: c.id, content: c.content, createdAt: c.created_at, user: { id: c.user_id, fullName: c.full_name, email: c.email } }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// 3. SUBIR ARCHIVOS
app.post('/api/upload', upload.array('files'), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Sin archivos' });
        const uploadedFiles = req.files.map(file => ({
            originalName: file.originalname,
            mimetype: file.mimetype,
            path: `http://189.154.34.131:${PORT}/proyectos/${file.filename}`
        }));
        res.json(uploadedFiles);
    } catch (error) { res.status(500).json({ message: 'Error upload' }); }
});

// 4. AUTH (Register/Login)
app.post('/api/auth/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ message: 'Correo registrado' });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newId = uuidv4();
        await pool.query('INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)', [newId, fullName, email, hash]);
        res.status(201).json({ message: 'Creado', user: { id: newId, fullName, email } });
    } catch (error) { 
        if (error.sqlState === '45000') return res.status(400).json({ message: 'Correo debe ser @utparral' });
        res.status(500).json({ message: 'Error server' }); 
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Credenciales incorrectas' });
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Credenciales incorrectas' });
        res.json({ message: 'Login OK', user: { id: user.id, fullName: user.full_name, email: user.email } });
    } catch (error) { res.status(500).json({ message: 'Error server' }); }
});

app.get('/api/users', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Falta email' });
    try {
        const [rows] = await pool.query('SELECT id, full_name as fullName, email FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: 'Error server' }); }
});

// 5. PERFIL Y CREAR PROYECTO
app.get('/api/users/:userId/projects', async (req, res) => {
    const { userId } = req.params;
    try {
        const qOwned = `SELECT p.id, p.title, p.description, p.category, p.created_at, p.originality_score, p.progress, u.id as owner_id, u.full_name as owner_name, u.email as owner_email FROM projects p JOIN users u ON p.owner_id = u.id WHERE p.owner_id = ? ORDER BY p.created_at DESC`;
        const [owned] = await pool.query(qOwned, [userId]);
        const qCollab = `SELECT p.id, p.title, p.description, p.category, p.created_at, p.originality_score, p.progress, u.id as owner_id, u.full_name as owner_name, u.email as owner_email FROM projects p JOIN project_participants pp ON p.id = pp.project_id JOIN users u ON p.owner_id = u.id WHERE pp.user_id = ? ORDER BY p.created_at DESC`;
        const [collab] = await pool.query(qCollab, [userId]);
        const format = r => ({ id: r.id, title: r.title, description: r.description, category: r.category, createdAt: r.created_at, originalityScore: r.originality_score, progress: r.progress, owner: { id: r.owner_id, fullName: r.owner_name, email: r.owner_email }, participants: [], files: [] });
        res.json({ owned: owned.map(format), collaborating: collab.map(format) });
    } catch (e) { res.status(500).json({ message: 'Error perfil' }); }
});

app.post('/api/projects', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { title, description, category, ownerId, participants, files, originalityScore, originalityJustification, progress } = req.body;
        await conn.beginTransaction();
        const pid = uuidv4();
        
        // INSERCIÓN CON PROGRESS
        await conn.query('INSERT INTO projects (id, title, description, category, owner_id, originality_score, originality_justification, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [pid, title, description, category, ownerId, originalityScore, originalityJustification, progress || 0]);
        
        if (participants?.length) await conn.query('INSERT INTO project_participants (project_id, user_id, role) VALUES ?', [participants.map(uid => [pid, uid, 'Colaborador'])]);
        if (files?.length) await conn.query('INSERT INTO project_files (id, project_id, file_name, file_url, file_type) VALUES ?', [files.map(f => [uuidv4(), pid, f.name, f.url, f.type])]);
        await conn.commit();
        res.status(201).json({ message: 'Creado', projectId: pid });
    } catch (e) { await conn.rollback(); console.error(e); res.status(500).json({ message: 'Error creando' }); } finally { conn.release(); }
});

// --- NUEVO ENDPOINT: ACTUALIZAR PROYECTO (PUT) ---
app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    // Ahora extraemos también 'files' y 'participants' del body
    const { title, description, category, progress, files, participants } = req.body;

    const conn = await pool.getConnection(); // Necesitamos una conexión para la transacción

    try {
        await conn.beginTransaction(); // Iniciamos transacción para asegurar integridad

        // 1. Actualizar datos básicos del proyecto
        await conn.query(
            'UPDATE projects SET title = ?, description = ?, category = ?, progress = ? WHERE id = ?',
            [title, description, category, progress, id]
        );

        // 2. ACTUALIZAR ARCHIVOS
        // Estrategia: Borrar todos los archivos asociados a este proyecto y re-insertar la lista nueva que llega del front
        await conn.query('DELETE FROM project_files WHERE project_id = ?', [id]);
        
        if (files && files.length > 0) {
            // Preparamos el array para inserción masiva
            const fileValues = files.map(f => [uuidv4(), id, f.name, f.url, f.type]);
            await conn.query(
                'INSERT INTO project_files (id, project_id, file_name, file_url, file_type) VALUES ?', 
                [fileValues]
            );
        }

        // 3. ACTUALIZAR PARTICIPANTES (Misma estrategia: borrar y re-insertar)
        // Nota: El frontend envía un array de IDs de usuarios en 'participants'
        await conn.query('DELETE FROM project_participants WHERE project_id = ?', [id]);

        if (participants && participants.length > 0) {
            const participantValues = participants.map(userId => [id, userId, 'Colaborador']);
            await conn.query(
                'INSERT INTO project_participants (project_id, user_id, role) VALUES ?',
                [participantValues]
            );
        }
        
        await conn.commit(); // Confirmar cambios
        res.json({ message: 'Proyecto, archivos y participantes actualizados exitosamente' });

    } catch (error) {
        await conn.rollback(); // Revertir cambios si algo falla
        console.error("Error actualizando:", error);
        res.status(500).json({ message: 'Error al actualizar el proyecto' });
    } finally {
        conn.release(); // Liberar conexión
    }
});

app.post('/api/projects/:id/comments', async (req, res) => {
    try { await pool.query('INSERT INTO comments (id, project_id, user_id, content) VALUES (?, ?, ?, ?)', [uuidv4(), req.params.id, req.body.userId, req.body.content]); res.status(201).json({ message: 'Comentado' }); } catch (e) { res.status(500).json({ message: 'Error comentario' }); }
});

app.listen(PORT, () => console.log(`🔥 Servidor listo en http://189.154.34.131:${PORT}`));