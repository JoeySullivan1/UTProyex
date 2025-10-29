import React, { useState, useEffect } from 'react';
import { Project, User, Page, Comment as CommentType } from './types';
import { mockProjects, mockUsers } from './data/mockData';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Auth);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    
    setProjects(mockProjects);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setCurrentPage(Page.Home);
    } else {
      setCurrentPage(Page.Auth);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRegister = (user: User) => {
    setUsers([...users, user]);
    setCurrentUser(user);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedProjectId(null);
    setProjectToEdit(null); 
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage(Page.Project);
  };

  const handleAddProject = (project: Project) => {
    setProjects(prevProjects => [project, ...prevProjects]);
    handleNavigate(Page.Home);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    handleNavigate(Page.Profile); 
  };

  const handleStartEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToEdit(project);
      setCurrentPage(Page.Upload); 
    }
  };

  const handleAddComment = (projectId: string, comment: CommentType) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === projectId 
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
  };

  const userProjectCount = currentUser ? projects.filter(p => p.owner.id === currentUser.id).length : 0;

  const renderPage = () => {
    switch (currentPage) {
      case Page.Auth:
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} existingUsers={users} />;
      case Page.Home:
        return <HomePage projects={projects} onSelectProject={handleSelectProject} />;
      case Page.Project:
        const project = projects.find(p => p.id === selectedProjectId);
        if (project && currentUser) {
          return <ProjectPage project={project} currentUser={currentUser} onAddComment={handleAddComment} onBack={() => handleNavigate(Page.Home)} />;
        }
        return <HomePage projects={projects} onSelectProject={handleSelectProject} />;
      case Page.Upload:
        if (currentUser) {
          return <UploadPage 
                    currentUser={currentUser} 
                    allUsers={users} 
                    onAddProject={handleAddProject}
                    projectToEdit={projectToEdit}
                    onUpdateProject={handleUpdateProject}
                    userProjectCount={userProjectCount}
                 />;
        }
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} existingUsers={users} />;
      case Page.Profile:
        if (currentUser) {
            return <ProfilePage 
                    currentUser={currentUser} 
                    projects={projects} 
                    onSelectProject={handleSelectProject} 
                    onStartEdit={handleStartEdit}
                   />;
        }
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} existingUsers={users} />;
      default:
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} existingUsers={users} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} userProjectCount={userProjectCount} />
      <main className="container mx-auto p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
