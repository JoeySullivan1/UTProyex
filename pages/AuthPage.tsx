import React, { useState } from 'react';
import { User } from '../types';
import Logo from '/Logo.png';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- VALIDACIÓN DE CORREO ---
  const validateEmail = (email: string): boolean => {
    const emailLower = email.toLowerCase();
    
  
    const regex = /^[a-z]{4}08\d{7,}@utparral\.edu\.mx$/;
    
    return regex.test(emailLower);
  };

  const validatePassword = (pass: string): string => {
    if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'La contraseña debe contener al menos una letra mayúscula.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validaciones
    if (!validateEmail(email)) {
      if (!email.toLowerCase().endsWith('@utparral.edu.mx')) {
          setError('El correo debe ser del dominio @utparral.edu.mx');
      } else {
          // Mensaje específico si el dominio es correcto pero el formato de matrícula no
          setError('El correo es inválido');
      }
      return;
    }

    if (!isLogin) {
        // Validar complejidad de contraseña
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Validar que coincidan
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (!fullName) {
            setError('El nombre completo es requerido.');
            return;
        }
    }

    setIsLoading(true);

    try {
        const BASE_URL = 'http://localhost:4000/api/auth'; 
        const endpoint = isLogin ? `${BASE_URL}/login` : `${BASE_URL}/register`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                fullName: isLogin ? undefined : fullName 
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la autenticación');
        }

        if (isLogin) {
            onLogin(data.user);
        } else {
            alert('Cuenta creada con éxito. Iniciando sesión...');
            onRegister(data.user);
        }

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ocurrió un error al conectar con el servidor.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-100 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="Logo" className="w-24 h-24 object-contain" />
          <h2 className="mt-4 text-3xl font-extrabold text-center text-gray-900">
            {isLogin ? 'Inicia Sesión' : 'Crea tu Cuenta'}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            {isLogin ? 'Para acceder a tu repositorio' : 'Únete al repositorio de proyectos'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                id="fullName"
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
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="correo@utparral.edu.mx"
            />
            {/* Pequeña ayuda visual del formato */}
            {!isLogin && (
                <p className="text-xs text-gray-400 mt-1"></p>
            )}
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="********"
            />
            {!isLogin && (
              <p className="mt-2 text-xs text-gray-500">
                Debe tener al menos 8 caracteres y una mayúscula.
              </p>
            )}
          </div>

          {/* CAMPO DE CONFIRMAR CONTRASEÑA */}
          {!isLogin && (
            <div>
                <label htmlFor="confirmPassword"className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Repite tu contraseña"
                />
            </div>
          )}

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200 text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-5 py-2 text-lg font-semibold text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isLoading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
            </button>
          </div>
        </form>

        <div className="text-sm text-center text-gray-600">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFullName('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="ml-1 font-medium text-blue-500 hover:text-blue-600 focus:outline-none"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;