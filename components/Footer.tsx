import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">UT<span className="text-green-500">Proyex</span></h3>
            <p className="text-sm mt-2 max-w-md">
              Plataforma para la gestión y exposición de proyectos académicos de estudiantes universitarios.
            </p>
          </div>
          <div className="text-sm text-center md:text-right space-y-1">
            <p>&copy; {new Date().getFullYear()} UTProyex.</p>
            <p>Todos los derechos reservados.</p>
            <div className="flex justify-center md:justify-end space-x-4 mt-2">
                <a href="#" className="hover:text-green-400 transition-colors">Términos</a>
                <a href="#" className="hover:text-green-400 transition-colors">Privacidad</a>
                <a href="#" className="hover:text-green-400 transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;