
import React, { useState, useRef, useEffect } from 'react';
import { Project, User, Comment as CommentType } from '../types';
import { getProjectInsightsStream } from '../services/geminiService';
import { UserGroupIcon, PaperClipIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, SparklesIcon, ArrowUturnLeftIcon, CheckBadgeIcon } from '../components/Icons';
import Spinner from '../components/Spinner';

// Helper component for AI Chat
interface AIChatProps {
  project: Project;
}

const AIChat: React.FC<AIChatProps> = ({ project }) => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
            const updatedHistory = [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunkText }];
            return updatedHistory;
          }
          return prev;
        });
      }
    } catch (error) {
      setChatHistory(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'model') {
            return [...prev.slice(0, -1), { ...lastMessage, text: 'Lo siento, ocurrió un error.' }];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8 lg:mt-0">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <SparklesIcon className="w-6 h-6 mr-2 text-emerald-500" />
        Pregúntale a la IA sobre este proyecto
      </h3>
      <div className="h-80 bg-gray-50 rounded-lg p-4 overflow-y-auto flex flex-col space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text || <Spinner size="sm" />}
            </div>
          </div>
        ))}
         <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleAsk} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Escribe tu pregunta aquí..."
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


// Helper component for Comments
interface CommentSectionProps {
  project: Project;
  currentUser: User;
  onAddComment: (projectId: string, comment: CommentType) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ project, currentUser, onAddComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: CommentType = {
            id: `c${Date.now()}`,
            user: currentUser,
            content: newComment,
            createdAt: new Date().toISOString()
        };
        onAddComment(project.id, comment);
        setNewComment('');
    };
    
    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-emerald-500" />
                Comentarios ({project.comments.length})
            </h3>
            <div className="space-y-4">
                {project.comments.map(comment => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2">
                            <p className="font-semibold text-gray-900">{comment.user.fullName}</p>
                            <span className="text-xs text-gray-500 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-6 flex flex-col">
                 <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-2"
                    rows={3}
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors self-end">
                    Enviar Comentario
                </button>
            </form>
        </div>
    );
};

// Main Project Page Component
interface ProjectPageProps {
  project: Project;
  currentUser: User;
  onAddComment: (projectId: string, comment: CommentType) => void;
  onBack: () => void;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ project, currentUser, onAddComment, onBack }) => {
  return (
    <div className="animate-fade-in">
        <button onClick={onBack} className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-800 font-semibold mb-6">
            <ArrowUturnLeftIcon className="w-5 h-5"/>
            <span>Volver a Proyectos</span>
        </button>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full mb-3">{project.category}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{project.title}</h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-5 h-5" />
                <span>{project.participants.map(p => p.fullName).join(', ')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{project.description}</p>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                <PaperClipIcon className="w-5 h-5 mr-2" />
                Archivos Adjuntos
              </h4>
              <ul className="space-y-2">
                {project.files.map(file => (
                  <li key={file.id}>
                    <a href={file.url} className="text-emerald-600 hover:underline">{file.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                    <CheckBadgeIcon className="w-5 h-5 mr-2 text-sky-500" />
                    Sello de Originalidad
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-lg">Puntuación: <span className="text-emerald-600">{project.originalityScore}/100</span></p>
                    <p className="text-gray-600 text-sm italic mt-1">"{project.originalityJustification}"</p>
                </div>
            </div>
          </div>

          <CommentSection project={project} currentUser={currentUser} onAddComment={onAddComment} />
        </div>

        <div className="lg:col-span-1">
          <AIChat project={project} />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;