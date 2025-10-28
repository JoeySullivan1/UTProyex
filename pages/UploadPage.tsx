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

const UploadPage: React.FC<UploadPageProps> = ({ currentUser, allUsers, onAddProject, projectToEdit, onUpdateProject, userProjectCount }) => {
  const isEditMode = !!projectToEdit;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [participants, setParticipants] = useState<User[]>([currentUser]);
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantError, setParticipantError] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setParticipants(projectToEdit.participants);
      setExistingFiles(projectToEdit.files);
      setNewFiles([]);
    } else {
        setParticipants([currentUser]);
        setNewFiles([]);
        setExistingFiles([]);
    }
  }, [projectToEdit, isEditMode, currentUser]);


  const handleAddParticipant = () => {
    setParticipantError('');
    if (!participantEmail.toLowerCase().endsWith('@utparral.edu.mx')) {
        setParticipantError('El correo debe ser del dominio @utparral.edu.mx.');
        return;
    }
    const user = allUsers.find(u => u.email.toLowerCase() === participantEmail.toLowerCase());
    if (!user) {
      setParticipantError('No se encontró un usuario con ese correo.');
      return;
    }
    if (participants.some(p => p.id === user.id)) {
      setParticipantError('Este usuario ya es participante.');
      return;
    }
    setParticipants(prev => [...prev, user]);
    setParticipantEmail('');
  };
  
  const handleRemoveParticipant = (userId: string) => {
    if (userId === currentUser.id) return; // Prevent removing the owner
    setParticipants(prev => prev.filter(p => p.id !== userId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveNewFile = (fileToRemove: File) => {
    setNewFiles(prev => prev.filter(file => file !== fileToRemove));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || participants.length === 0) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const newProjectFiles: ProjectFile[] = newFiles.map(file => ({
        id: `f${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        url: '#', // Placeholder URL
      }));

      if (isEditMode && projectToEdit) {
        const updatedProject = {
          ...projectToEdit,
          title,
          description,
          category,
          participants,
          files: [...existingFiles, ...newProjectFiles],
        };
        onUpdateProject(updatedProject);
      } else {
        const originalityResult = await calculateOriginality(description);
        const newProject: Project = {
          id: `p${Date.now()}`,
          title,
          description,
          category,
          owner: currentUser,
          participants,
          files: newProjectFiles,
          comments: [],
          originalityScore: originalityResult.score,
          originalityJustification: originalityResult.justification,
          createdAt: new Date().toISOString(),
        };
        onAddProject(newProject);
      }
    } catch (err) {
      setError(`Ocurrió un error al ${isEditMode ? 'actualizar' : 'crear'} el proyecto. Inténtalo de nuevo.`);
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{isEditMode ? 'Editar Proyecto' : 'Subir Nuevo Proyecto'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Proyecto</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" required placeholder="Describe tu proyecto, los objetivos, la tecnología utilizada, etc. Mientras más detallado, mejor será el análisis de originalidad." />
        </div>

        <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white" required>
                <option value="" disabled>Selecciona una categoría</option>
                {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
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
            <div className="flex items-center space-x-2">
                <input type="email" value={participantEmail} onChange={(e) => setParticipantEmail(e.target.value)} placeholder="correo@utparral.edu.mx" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                <button type="button" onClick={handleAddParticipant} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Añadir</button>
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

        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300">
            {isLoading ? (
              <><Spinner size="sm" /><span className="ml-2">Procesando...</span></>
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