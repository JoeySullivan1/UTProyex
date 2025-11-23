import React, { useState, useEffect } from 'react';
import { Project, User, ProjectFile } from '../types';
import { calculateOriginality } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { PaperClipIcon, XCircleIcon } from '../components/Icons';

interface UploadPageProps {
  currentUser: User;
  allUsers: User[]; 
  onAddProject: (project: Project) => void;
  projectToEdit?: Project | null;
  onUpdateProject: (project: Project) => void;
  userProjectCount: number;
}

const projectCategories = ["Software", "Mecatrónica", "Energías Renovables", "Administración", "Diseño Digital", "Biotecnología", "Otro"];

// --- FUNCIÓN PARA SUBIR ARCHIVOS FÍSICOS ---
const uploadFilesToServer = async (files: File[]) => {
  const formData = new FormData();
  // Asegúrate de que el nombre 'files' coincida con upload.array('files') en tu backend
  files.forEach(file => formData.append('files', file));
  const BACKEND_URL = 'http://189.154.34.131:4000/api/upload';

  const response = await fetch(BACKEND_URL, { method: 'POST', body: formData });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error subiendo archivos: ${errorText}`);
  }
  return await response.json();
};

// --- FUNCIÓN: GUARDAR PROYECTO EN BD (POST) ---
const saveProjectToDB = async (projectData: any) => {
    const response = await fetch('http://189.154.34.131:4000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });

    if (!response.ok) throw new Error('Error al guardar el proyecto en la base de datos.');
    return await response.json();
};

// --- FUNCIÓN: ACTUALIZAR PROYECTO EN BD (PUT) ---
const updateProjectInDB = async (id: string, projectData: any) => {
    const response = await fetch(`http://189.154.34.131:4000/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });

    if (!response.ok) throw new Error('Error al actualizar el proyecto.');
    return await response.json();
};

// --- FUNCIÓN NUEVA: BUSCAR USUARIO EN BD (Para reconocer usuarios registrados) ---
const findUserByEmail = async (email: string) => {
    const response = await fetch(`http://189.154.34.131:4000/api/users?email=${email}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Error al buscar usuario');
    return await response.json(); // Devuelve { id, fullName, email }
};

const UploadPage: React.FC<UploadPageProps> = ({ currentUser, allUsers, onAddProject, projectToEdit, onUpdateProject, userProjectCount }) => {
  const isEditMode = !!projectToEdit;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [progress, setProgress] = useState(50);
  const [participants, setParticipants] = useState<User[]>([currentUser]);
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantError, setParticipantError] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      // Cargar participantes existentes o poner al dueño por defecto
      setParticipants(projectToEdit.participants && projectToEdit.participants.length > 0 
          ? projectToEdit.participants 
          : [currentUser]);
      setExistingFiles(projectToEdit.files || []);
      setProgress(projectToEdit.progress);
      setNewFiles([]);
    } else {
        setTitle('');
        setDescription('');
        setCategory('');
        setParticipants([currentUser]);
        setNewFiles([]);
        setExistingFiles([]);
        setProgress(50);
    }
  }, [projectToEdit, isEditMode, currentUser]);

  // --- LÓGICA DE AGREGAR PARTICIPANTE (BUSCANDO EN BD) ---
  const handleAddParticipant = async () => {
    setParticipantError('');
    
    if (!participantEmail.toLowerCase().endsWith('@utparral.edu.mx')) {
        setParticipantError('El correo debe ser del dominio @utparral.edu.mx.');
        return;
    }
    
    if (participants.some(p => p.email.toLowerCase() === participantEmail.toLowerCase())) {
        setParticipantError('Este usuario ya está agregado a la lista.');
        return;
    }

    try {
        setIsSearchingUser(true);
        // Buscamos en el backend en lugar de la lista local 'allUsers'
        const foundUser = await findUserByEmail(participantEmail);

        if (!foundUser) {
            setParticipantError('El usuario no está registrado en la base de datos.');
            return;
        }

        setParticipants(prev => [...prev, foundUser]);
        setParticipantEmail('');

    } catch (err) {
        console.error(err);
        setParticipantError('Error de conexión al buscar usuario.');
    } finally {
        setIsSearchingUser(false);
    }
  };
  
  const handleRemoveParticipant = (userId: string) => {
    if (userId === currentUser.id) return; // Evitar borrar al dueño
    setParticipants(prev => prev.filter(p => p.id !== userId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleRemoveNewFile = (fileToRemove: File) => {
    setNewFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDACIÓN
    if (!title || !description || !category) {
      setError('Por favor, completa título, descripción y categoría.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      let finalProjectFiles: ProjectFile[] = [...existingFiles];

      // 1. Subir archivos nuevos
      if (newFiles.length > 0) {
          const uploadedData = await uploadFilesToServer(newFiles);
          
          // --- CORRECCIÓN AQUÍ ---
          // Se asegura de leer 'originalname' (estándar) o 'originalName' por si acaso.
          const uploadedProjectFiles = uploadedData.map((fileData: any, index: number) => ({
              id: `temp-${Date.now()}-${index}`, 
              name: fileData.originalname || fileData.originalName || fileData.filename || 'Archivo sin nombre',
              type: fileData.mimetype,
              url: fileData.path 
          }));
          
          finalProjectFiles = [...finalProjectFiles, ...uploadedProjectFiles];
      }

      if (isEditMode && projectToEdit) {
        // --- MODO EDICIÓN (PUT) ---
        const updatePayload = {
            title,
            description,
            category,
            progress,
            participants: participants.map(p => p.id),
            // Mapeamos correctamente los archivos finales (existentes + nuevos subidos)
            files: finalProjectFiles.map(f => ({ 
                name: f.name, 
                url: f.url, 
                type: f.type 
            }))
        };

        await updateProjectInDB(projectToEdit.id, updatePayload);

        const updatedProject: Project = {
          ...projectToEdit,
          title, description, category, participants, files: finalProjectFiles, progress,
        };
        onUpdateProject(updatedProject);

      } else {
        // --- MODO CREACIÓN (POST) ---
        const originalityResult = await calculateOriginality(description);

        const dbPayload = {
            title,
            description,
            category,
            ownerId: currentUser.id,
            participants: participants.map(p => p.id), 
            files: finalProjectFiles.map(f => ({ name: f.name, url: f.url, type: f.type })), 
            originalityScore: originalityResult.score,
            originalityJustification: originalityResult.justification,
            progress 
        };

        const dbResponse = await saveProjectToDB(dbPayload);

        const newProject: Project = {
          id: dbResponse.projectId, 
          title,
          description,
          category,
          owner: currentUser,
          participants,
          files: finalProjectFiles,
          comments: [],
          originalityScore: originalityResult.score,
          originalityJustification: originalityResult.justification,
          createdAt: new Date().toISOString(),
          progress,
        };
        onAddProject(newProject);
      }

    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (userProjectCount >= 2 && !isEditMode) {
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600">Límite de Proyectos Alcanzado</h2>
            <p className="text-gray-600 mt-4">Ya has subido el máximo de 2 proyectos permitidos.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{isEditMode ? 'Editar Proyecto' : 'Subir Nuevo Proyecto'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Proyecto</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
          <label htmlFor="description" className="block text-xs font-medium text-gray-500">-Recomendable agregar al final de la descripción, que se podría mejorar de proyecto o cuales eran las espectativas iniciales respecto a como terminó</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required placeholder="Describe tu proyecto..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white" required>
                    <option value="" disabled>Selecciona una categoría</option>
                    {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
                    Estado del Proyecto: <span className="font-bold text-emerald-600">{progress}%</span>
                </label>
                <label htmlFor="description" className="block text-xs font-medium text-gray-500">-Es el estado en el que se encuentra el proyecto al momento de la entrega final, refleja si es posible continuarlo</label>
                <input type="range" id="progress" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="mt-1 block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Archivos Adjuntos</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                            <span>Selecciona archivos</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">o arrástralos aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, ZIP, DOCX, etc.</p>
                </div>
            </div>
            {(existingFiles.length > 0 || newFiles.length > 0) && (
                <div className="mt-3 space-y-2">
                    {existingFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm">
                            <span className="text-gray-500 truncate italic">{file.name} (guardado)</span>
                        </div>
                    ))}
                    {newFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-emerald-50 p-2 rounded-md text-sm">
                            <span className="text-gray-800 truncate">{file.name}</span>
                            <button type="button" onClick={() => handleRemoveNewFile(file)} className="text-red-500 hover:text-red-700">
                               <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div>
            <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">Participantes</label>
             <label htmlFor="description" className="block text-xs font-medium text-gray-500">-Agrega aquellos alumnos que sean parte del proyecto.</label>
            <div className="flex items-center space-x-2">
                <input type="email" value={participantEmail} onChange={(e) => setParticipantEmail(e.target.value)} placeholder="correo@utparral.edu.mx" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" disabled={isSearchingUser} />
                <button type="button" onClick={handleAddParticipant} disabled={isSearchingUser} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold disabled:bg-gray-100">
                    {isSearchingUser ? 'Buscando...' : 'Añadir'}
                </button>
            </div>
            {participantError && <p className="text-red-500 text-xs mt-1">{participantError}</p>}
            <div className="mt-3 space-y-2">
                {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span className="text-sm text-gray-800">{p.fullName} {p.id === currentUser.id && '(Tú)'}</span>
                        {p.id !== currentUser.id && (
                            <button type="button" onClick={() => handleRemoveParticipant(p.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Quitar</button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}
        
        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300">
            {isLoading ? (
              <><Spinner size="sm" /><span className="ml-2">Guardando...</span></>
            ) : (
              isEditMode ? 'Guardar Cambios' : 'Analizar y Subir Proyecto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;