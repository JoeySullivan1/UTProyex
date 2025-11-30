import React, { useState, useEffect } from 'react';
import { Project, User, Page } from './types';
// Eliminamos mockUsers e importaciones de datos falsos
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Auth);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // --- CARGAR PROYECTOS DESDE EL BACKEND (FEED) ---
  const fetchProjects = async () => {
    // Si no hay usuario, no intentamos cargar nada
    if (!currentUser) {
       setLoading(false);
       return;
    }

    setLoading(true);
    try {
      // Conexión al Backend real
      const response = await fetch('https://utproyex.ddns.net:4000/api/projects');
      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos cuando cambia el usuario (login) o volvemos al Home
  useEffect(() => {
    if (currentUser && currentPage === Page.Home) {
      fetchProjects();
    }
  }, [currentUser, currentPage]);

  // Manejo de Sesión
  useEffect(() => {
    if (currentUser) {
      if (currentPage === Page.Auth) setCurrentPage(Page.Home);
    } else {
      setCurrentPage(Page.Auth);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(Page.Home);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage(Page.Auth);
    setProjects([]);
    setSelectedProjectId(null);
  };

  // El registro ahora lo maneja el backend, aquí solo recibimos el usuario logueado
  const handleRegister = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(Page.Home);
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

  // Al agregar, volvemos al Home y recargamos la lista del servidor
  const handleAddProject = (project: Project) => {
    handleNavigate(Page.Home);
    fetchProjects(); 
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    handleNavigate(Page.Profile); 
    // ProfilePage recargará sus propios datos al montarse
  };

  const handleStartEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToEdit(project);
      setCurrentPage(Page.Upload); 
    }
  };

  // Calcular proyectos del usuario (Opcional, solo para el Header)
  const userProjectCount = currentUser ? projects.filter(p => p.owner.id === currentUser.id).length : 0;

  const renderPage = () => {
    if (currentUser && loading && projects.length === 0 && currentPage === Page.Home) {
        return <div className="flex justify-center mt-20"><p className="text-gray-500">Cargando proyectos...</p></div>;
    }

    switch (currentPage) {
      case Page.Auth:
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
        
      case Page.Home:
        return <HomePage projects={projects} onSelectProject={handleSelectProject} />;
        
      case Page.Project:
        // IMPORTANTE: Aquí pasamos solo el ID. ProjectPage se encargará de buscar los datos frescos (incluidos comentarios).
        if (selectedProjectId && currentUser) {
          return (
            <ProjectPage 
                projectId={selectedProjectId} 
                currentUser={currentUser} 
                onBack={() => handleNavigate(Page.Home)} 
            />
          );
        }
        return <HomePage projects={projects} onSelectProject={handleSelectProject} />;
        
      case Page.Upload:
        if (currentUser) {
          return <UploadPage 
                    currentUser={currentUser} 
                    allUsers={[currentUser]} 
                    onAddProject={handleAddProject}
                    projectToEdit={projectToEdit}
                    onUpdateProject={handleUpdateProject}
                    userProjectCount={userProjectCount}
                 />;
        }
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
        
      case Page.Profile:
        if (currentUser) {
            // ProfilePage ahora busca sus propios datos en la BD
            return <ProfilePage 
                    currentUser={currentUser} 
                    onSelectProject={handleSelectProject} 
                    onStartEdit={handleStartEdit}
                   />;
        }
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
        
      default:
        return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} userProjectCount={userProjectCount} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;