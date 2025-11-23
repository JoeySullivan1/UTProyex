import React, { useEffect, useState } from 'react';
import { User, Project } from '../types';
import { PencilSquareIcon } from '../components/Icons';
import Spinner from '../components/Spinner';

interface ProfilePageProps {
  currentUser: User;
  // Ya no recibimos 'projects' como prop, porque los cargamos de la BD
  onSelectProject: (projectId: string) => void;
  onStartEdit: (projectId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onSelectProject, onStartEdit }) => {
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [collaboratingProjects, setCollaboratingProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- EFECTO: CARGAR PROYECTOS DESDE MYSQL ---
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoading(true);
        setError('');
        
        // URL del Backend Node.js
        const BACKEND_URL = `http://189.154.34.131:4000/api/users/${currentUser.id}/projects`;
        
        const response = await fetch(BACKEND_URL);
        
        if (!response.ok) {
            throw new Error('Error al obtener los proyectos del servidor.');
        }

        const data = await response.json();
        
        // El backend nos devuelve { owned: [...], collaborating: [...] }
        setOwnedProjects(data.owned);
        setCollaboratingProjects(data.collaborating);

      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError('No se pudieron cargar los proyectos. Verifica que el backend esté encendido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, [currentUser.id]);


  // Lógica de validación de fecha (5 días para editar)
  const isEditable = (createdAt: string) => {
    const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
    const projectDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return (now - projectDate) < fiveDaysInMillis;
  };
  
  const ProjectListItem: React.FC<{project: Project, isOwner: boolean}> = ({ project, isOwner }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border border-gray-100 hover:shadow-md transition-shadow">
      <div>
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
            {project.category || 'General'}
        </span>
        <p 
          className="font-semibold text-gray-800 hover:text-emerald-600 hover:underline cursor-pointer mt-1 text-lg"
          onClick={() => onSelectProject(project.id)}
        >
          {project.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isOwner ? 'Creado por ti' : `Creado por ${project.owner.fullName}`} • {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      {isOwner && (
        <div className="relative group ml-4">
            <button
              onClick={() => onStartEdit(project.id)}
              disabled={!isEditable(project.createdAt)}
              className="p-2 rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              aria-label="Editar proyecto"
            >
              <PencilSquareIcon className="w-6 h-6" />
            </button>
            {!isEditable(project.createdAt) && (
                 <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center pointer-events-none">
                    La edición solo está permitida por 5 días después de la creación.
                 </div>
            )}
        </div>
      )}
    </div>
  );

  if (isLoading) {
      return (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
             <Spinner size="md" /> 
             <span className="text-gray-500 font-medium">Cargando datos del perfil...</span>
          </div>
      );
  }

  if (error) {
      return (
          <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-600 rounded-lg text-center border border-red-200 shadow-sm">
              <p className="font-bold mb-2">Error de Conexión</p>
              <p>{error}</p>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-10">
      {/* Tarjeta de Usuario */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-6">
        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600 shadow-inner">
            {currentUser.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{currentUser.fullName}</h1>
            <p className="text-gray-500 text-lg">{currentUser.email}</p>
            <div className="mt-2 flex space-x-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">Alumno UT Parral</span>
            </div>
        </div>
      </div>

      {/* Sección: Mis Proyectos */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Mis Proyectos <span className="text-gray-400 text-lg font-normal">({ownedProjects.length})</span></h2>
        </div>
        
        {ownedProjects.length > 0 ? (
          <div className="space-y-4">
            {ownedProjects.map(p => <ProjectListItem key={p.id} project={p} isOwner={true} />)}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Aún no has subido ningún proyecto.</p>
          </div>
        )}
      </div>

      {/* Sección: Colaboraciones */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Colaboraciones <span className="text-gray-400 text-lg font-normal">({collaboratingProjects.length})</span></h2>
        {collaboratingProjects.length > 0 ? (
          <div className="space-y-4">
            {collaboratingProjects.map(p => <ProjectListItem key={p.id} project={p} isOwner={false} />)}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">No estás colaborando en ningún proyecto actualmente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;