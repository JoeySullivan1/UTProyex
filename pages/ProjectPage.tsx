import React, { useState, useRef, useEffect } from 'react';
import { Project, User, Comment as CommentType } from '../types';
import { getProjectInsightsStream } from '../services/geminiService';
import { UserGroupIcon, PaperClipIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, SparklesIcon, ArrowUturnLeftIcon, CheckBadgeIcon } from '../components/Icons';
import Spinner from '../components/Spinner';

// URL del Backend
const API_URL = 'http://localhost:4000/api';

// --- COMPONENTE CHAT IA ---
interface AIChatProps {
  project: Project;
}

const AIChat: React.FC<AIChatProps> = ({ project }) => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, text: question };
    setChatHistory(prev => [...prev, userMessage, { role: 'model' as const, text: '' }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const stream = await getProjectInsightsStream(project.description, question);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setChatHistory(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'model') {
            return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunkText }];
          }
          return prev;
        });
      }
    } catch (error) {
      setChatHistory(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'model') {
            return [...prev.slice(0, -1), { ...lastMessage, text: 'Lo siento, ocurrió un error al consultar la IA.' }];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8 lg:mt-0 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <SparklesIcon className="w-6 h-6 mr-2 text-emerald-500" />
        IA del Proyecto
      </h3>
      <div className="h-80 bg-gray-50 rounded-lg p-4 overflow-y-auto flex flex-col space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
              {msg.text || <Spinner size="sm" />}
            </div>
          </div>
        ))}
        {chatHistory.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">Haz preguntas sobre la descripción, tecnologías o justificación del proyecto.</p>
        )}
         <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleAsk} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Pregunta algo..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          disabled={isLoading}
        />
        <button type="submit" className="bg-green-500 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors" disabled={isLoading}>
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};


// --- SECCIÓN DE COMENTARIOS ---
interface CommentSectionProps {
  project: Project;
  currentUser: User;
  onCommentAdded: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ project, currentUser, onCommentAdded }) => {
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch(`${API_URL}/projects/${project.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    content: newComment
                })
            });

            if (!response.ok) throw new Error('Error al enviar comentario');

            setNewComment('');
            onCommentAdded();

        } catch (error) {
            console.error(error);
            alert('No se pudo enviar el comentario. Verifica que el backend esté funcionando.');
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-emerald-500" />
                Comentarios ({project.comments ? project.comments.length : 0})
            </h3>
            <div className="space-y-4 mb-6">
                {project.comments && project.comments.length > 0 ? project.comments.map(comment => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center mb-2 justify-between">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold mr-2 text-xs">
                                    {comment.user.fullName.charAt(0)}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{comment.user.fullName}</p>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm pl-10">{comment.content}</p>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center italic text-sm">Sé el primero en comentar.</p>
                )}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex flex-col">
                 <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-2 bg-white"
                    rows={3}
                    disabled={isSending}
                />
                <button 
                    type="submit" 
                    disabled={isSending}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors self-end font-medium disabled:bg-emerald-300"
                >
                    {isSending ? 'Enviando...' : 'Enviar Comentario'}
                </button>
            </form>
        </div>
    );
};


// --- PÁGINA PRINCIPAL DEL PROYECTO ---
interface ProjectPageProps {
  projectId: string;
  currentUser: User;
  onBack: () => void;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ projectId, currentUser, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para controlar si la descripción está expandida o colapsada
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const fetchProjectData = async () => {
      try {
          const response = await fetch(`${API_URL}/projects/${projectId}`);
          
          if (!response.ok) {
             throw new Error('Proyecto no encontrado o error de servidor');
          }
          
          const data = await response.json();
          setProject(data);
      } catch (err: any) {
          console.error("Error fetching project:", err);
          setError('No se pudo cargar el proyecto. Verifica la conexión con el backend.');
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      fetchProjectData();
  }, [projectId]);

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-96">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500">Cargando proyecto...</p>
          </div>
      );
  }

  if (error || !project) {
      return (
          <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'El proyecto no existe.'}</p>
              <button onClick={onBack} className="text-emerald-600 hover:underline font-semibold">Volver al inicio</button>
          </div>
      );
  }

  // Lógica para truncar la descripción
  const DESCRIPTION_LIMIT = 600;
  const showReadMoreButton = project.description.length > DESCRIPTION_LIMIT;
  const displayedDescription = isDescriptionExpanded || !showReadMoreButton
      ? project.description
      : project.description.slice(0, DESCRIPTION_LIMIT) + '...';

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0" >
        <button onClick={onBack} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-6 transition-colors">
            <ArrowUturnLeftIcon className="w-5 h-5"/>
            <span>Volver a página principal</span>
        </button>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* COLUMNA IZQUIERDA: DETALLES */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {project.category || 'General'}
                </span>
                <span className="text-gray-400 text-sm">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{project.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center">
                 <span className="font-bold mr-2 text-gray-800">Autor:</span> {project.owner?.fullName || 'Desconocido'}
              </div>
              <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <span>
                    {project.participants && project.participants.length > 0 
                        ? project.participants.map(p => p.fullName).join(', ') 
                        : 'Sin colaboradores'}
                </span>
              </div>
            </div>

            {/* Descripción con lógica de Leer Más */}
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
                {displayedDescription}
                {showReadMoreButton && (
                    <button 
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-emerald-600 hover:text-emerald-800 font-semibold ml-2 hover:underline focus:outline-none"
                    >
                        {isDescriptionExpanded ? 'Leer menos' : 'Leer más'}
                    </button>
                )}
            </div>

            {/* Sección de Archivos */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <PaperClipIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Archivos Adjuntos
              </h4>
              {project.files && project.files.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.files.map(file => (
                      <li key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center truncate">
                            <PaperClipIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 ml-2">
                            Descargar
                        </a>
                      </li>
                    ))}
                  </ul>
              ) : (
                  <p className="text-sm text-gray-500 italic">No hay archivos adjuntos.</p>
              )}
            </div>

            {/* Sección de Originalidad */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-r from-emerald-50 to-white p-4 rounded-lg border border-emerald-100">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                        <CheckBadgeIcon className="w-6 h-6 mr-2 text-emerald-500" />
                        Análisis de Originalidad
                    </h4>
                    <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4 max-w-xs">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${project.originalityScore || 0}%` }}></div>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">{project.originalityScore || 0}/100</span>
                    </div>
                    <p className="text-gray-600 text-sm italic border-l-4 border-emerald-200 pl-3">
                        "{project.originalityJustification || 'Sin análisis disponible.'}"
                    </p>
                </div>
            </div>
          </div>

          <CommentSection project={project} currentUser={currentUser} onCommentAdded={fetchProjectData} />
        </div>

        {/* COLUMNA DERECHA: IA */}
        <div className="lg:col-span-1">
            <div className="sticky top-6">
                 <AIChat project={project} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;