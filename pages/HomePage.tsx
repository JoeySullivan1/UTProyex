import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import Spinner from '../components/Spinner';

// Iconos internos para el carrusel (para evitar errores de importación externos)
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-400"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>;

interface HomePageProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  isLoading?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ projects, onSelectProject, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Estado para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Obtener los 3 mejores proyectos (Top Projects)
  const topProjects = useMemo(() => {
    // Hacemos una copia para no mutar el array original, ordenamos y cortamos
    return [...projects]
      .sort((a, b) => (b.originalityScore || 0) - (a.originalityScore || 0))
      .slice(0, 3);
  }, [projects]);

  const categories = useMemo(() => {
    const allCategories = projects.map(p => p.category);
    return ['Todos', ...Array.from(new Set(allCategories))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesCategory = selectedCategory === 'Todos' || project.category === selectedCategory;
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projects, searchTerm, selectedCategory]);

  // Funciones de navegación del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === topProjects.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? topProjects.length - 1 : prev - 1));
  };

  return (
    <div className="animate-fade-in">
      
      {/* SECCIÓN DE CARRUSEL (Solo si hay proyectos y no está cargando) */}
      {!isLoading && topProjects.length > 0 && (
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <StarIcon />
                <span className="ml-2">Proyectos Destacados</span>
            </h2>
            
            <div className="relative w-full p-1 rounded-xl">
                <div className="bg-gray-100 rounded-lg overflow-hidden relative min-h-[320px] flex items-center justify-center p-4 sm:p-8">
                    
                    {/* Botón Anterior */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="z-10 p-2 bg-white/80 hover:bg-white text-green-800 rounded-full shadow-md transition-all focus:outline-none"
                    >
                        <ChevronLeftIcon />
                    </button>

                    {/* Tarjeta del Proyecto Actual (Centrada y con ancho limitado para verse bien) */}
                    <div className="w-full max-w-lg transform transition-all duration-500 ease-in-out">
                        <ProjectCard 
                            project={topProjects[currentSlide]} 
                            onSelectProject={onSelectProject} 
                        />
                    </div>

                    {/* Botón Siguiente */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="z-10 p-2 bg-white/80 hover:bg-white text-green-800 rounded-full shadow-md transition-all focus:outline-none"
                    >
                        <ChevronRightIcon />
                    </button>

                    {/* Indicadores (Puntitos) */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                        {topProjects.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    currentSlide === idx ? 'bg-emerald-600' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Explorar Proyectos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-1 md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* GRID DE PROYECTOS + SPINNER */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-4 animate-pulse">Cargando repositorio...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} onSelectProject={onSelectProject} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No se encontraron proyectos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;