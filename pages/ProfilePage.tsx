import React from 'react';
import { User, Project } from '../types';
import { PencilSquareIcon } from '../components/Icons';

interface ProfilePageProps {
  currentUser: User;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onStartEdit: (projectId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, projects, onSelectProject, onStartEdit }) => {
  const ownedProjects = projects.filter(p => p.owner.id === currentUser.id);
  const collaboratingProjects = projects.filter(p =>
    p.owner.id !== currentUser.id && p.participants.some(participant => participant.id === currentUser.id)
  );

  const isEditable = (createdAt: string) => {
    const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
    const projectDate = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return (now - projectDate) < fiveDaysInMillis;
  };
  
  const ProjectListItem: React.FC<{project: Project, isOwner: boolean}> = ({ project, isOwner }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{project.category}</span>
        <p 
          className="font-semibold text-emerald-600 hover:underline cursor-pointer mt-1"
          onClick={() => onSelectProject(project.id)}
        >
          {project.title}
        </p>
        <p className="text-xs text-gray-500">
          {isOwner ? 'Creado por ti' : `Creado por ${project.owner.fullName}`} el {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>
      {isOwner && (
        <div className="relative group">
            <button
              onClick={() => onStartEdit(project.id)}
              disabled={!isEditable(project.createdAt)}
              className="p-2 rounded-md hover:bg-emerald-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              aria-label="Editar proyecto"
            >
              <PencilSquareIcon className="w-5 h-5 text-gray-600 disabled:text-gray-400" />
            </button>
            {!isEditable(project.createdAt) && (
                 <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap -translate-x-1/2 left-1/2">
                    La edición solo está permitida por 5 días.
                 </div>
            )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">{currentUser.fullName}</h1>
        <p className="text-gray-600">{currentUser.email}</p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Proyectos ({ownedProjects.length})</h2>
        {ownedProjects.length > 0 ? (
          <div className="space-y-4">
            {ownedProjects.map(p => <ProjectListItem key={p.id} project={p} isOwner={true} />)}
          </div>
        ) : (
          <p className="text-gray-500">Aún no has subido ningún proyecto.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Proyectos en los que Colaboro ({collaboratingProjects.length})</h2>
        {collaboratingProjects.length > 0 ? (
          <div className="space-y-4">
            {collaboratingProjects.map(p => <ProjectListItem key={p.id} project={p} isOwner={false} />)}
          </div>
        ) : (
          <p className="text-gray-500">No estás colaborando en ningún proyecto.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;