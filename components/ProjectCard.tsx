
import React from 'react';
import { Project } from '../types';
import { UserGroupIcon, CalendarDaysIcon, CheckBadgeIcon } from './Icons';

interface ProjectCardProps {
  project: Project;
  onSelectProject: (projectId: string) => void;
}

const OriginalitySeal: React.FC<{ score: number }> = ({ score }) => {
  const getSealDetails = () => {
    if (score >= 90) {
      return { color: 'text-amber-500', bgColor: 'bg-amber-100', text: 'Excepcional' };
    }
    if (score >= 75) {
      return { color: 'text-sky-500', bgColor: 'bg-sky-100', text: 'Innovador' };
    }
    if (score >= 50) {
      return { color: 'text-green-500', bgColor: 'bg-green-100', text: 'Sólido' };
    }
    return { color: 'text-gray-500', bgColor: 'bg-gray-100', text: 'Estándar' };
  };

  const { color, bgColor, text } = getSealDetails();

  return (
    <div className={`absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${color}`}>
      <CheckBadgeIcon className="w-4 h-4" />
      <span>{text} ({score})</span>
    </div>
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
  const { id, title, description, participants, createdAt, originalityScore, category, progress } = project;

  return (
    <div
      onClick={() => onSelectProject(id)}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
    >
      <div className="p-6 flex-grow">
        <OriginalitySeal score={originalityScore} />
        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{category}</span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
      </div>
      
      <div className="px-6 pb-6">
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-500">Avance</span>
                <span className="text-xs font-bold text-emerald-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-5 h-5" />
            <span>{participants.length} participante(s)</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="w-5 h-5" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
