import React from 'react';
import { User, Page } from '../types';
import { BookOpenIcon, UserCircleIcon, ArrowRightOnRectangleIcon, HomeIcon, PlusCircleIcon } from './Icons';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  userProjectCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigate, userProjectCount }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => currentUser ? onNavigate(Page.Home) : onNavigate(Page.Auth)}
        >
          
          <h1 className="text-2xl font-bold text-green-500 hidden md:block">
            UTP<span className="text-black">royex</span>
          </h1>
        </div>
        <nav className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <button
                onClick={() => onNavigate(Page.Home)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors duration-200"
                aria-label="Home"
              >
                <HomeIcon className="w-6 h-6" />
                <span className="hidden md:inline">Inicio</span>
              </button>
              <div className="relative group">
                <button
                  onClick={() => onNavigate(Page.Upload)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors duration-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  aria-label="Upload Project"
                  disabled={userProjectCount >= 2}
                >
                  <PlusCircleIcon className="w-6 h-6" />
                  <span className="hidden md:inline">Subir Proyecto</span>
                </button>
                {userProjectCount >= 2 && (
                  <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap -translate-x-1/2 left-1/2">
                    Has alcanzado el límite de 2 proyectos.
                  </div>
                )}
              </div>
              <button onClick={() => onNavigate(Page.Profile)} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                <UserCircleIcon className="w-8 h-8 text-gray-500" />
                <span className="font-medium text-gray-700 hidden lg:inline">{currentUser.fullName}</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </>
          ) : (
            <span className="text-gray-600">Bienvenido al repositorio de proyectos</span>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;