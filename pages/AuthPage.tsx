
import React, { useState } from 'react';
import { User } from '../types';
import { BookOpenIcon } from '../components/Icons';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  existingUsers: User[];
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, existingUsers }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@utparral.edu.mx');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('El correo debe tener la terminación "@utparral.edu.mx"');
      return;
    }

    if (isLogin) {
      // Mock login: just check if user exists
      const user = existingUsers.find(u => u.email === email);
      if (user) {
        onLogin(user);
      } else {
        setError('Correo o contraseña incorrectos.');
      }
    } else {
      // Mock register
      if (existingUsers.some(u => u.email === email)) {
        setError('Este correo electrónico ya está registrado.');
        return;
      }
      if (!fullName) {
          setError('El nombre completo es requerido.');
          return;
      }
      const newUser: User = {
        id: `u${Date.now()}`,
        fullName,
        email,
      };
      onRegister(newUser);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <BookOpenIcon className="w-12 h-12 text-emerald-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-center text-gray-900">
            {isLogin ? 'Inicia Sesión' : 'Crea tu Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            {isLogin ? 'Para acceder a tu repositorio de proyectos' : 'Únete al repositorio de proyectos'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Tu nombre completo"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico Institucional</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="nombre@utparral.edu.mx"
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="********"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full px-5 py-2 text-lg font-semibold text-white bg-green-500 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              {isLogin ? 'Entrar' : 'Registrarse'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="ml-1 font-medium text-emerald-600 hover:text-emerald-500"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;