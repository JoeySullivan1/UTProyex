import React, { useState } from 'react';
import { User } from '../types';
import Logo from '/Logo.png';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados de Registro
  const [showVerificationStep, setShowVerificationStep] = useState(false); // Controla el Paso 1 vs Paso 2
  const [verificationCode, setVerificationCode] = useState('');

  // Estados de Formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [fullName, setFullName] = useState('');
  
  // Estados de UI
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- VALIDACIONES ---
  const validateEmail = (email: string): boolean => {
    const emailLower = email.toLowerCase();
    // Regex estricto: 4 letras + 08 + min 7 números + @utparral...
    const regex = /^[a-z]{4}08\d{7,}@utparral\.edu\.mx$/;
    return regex.test(emailLower);
  };

  const validatePassword = (pass: string): string => {
    if (pass.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pass)) return 'La contraseña debe contener al menos una letra mayúscula.';
    return '';
  };

  // --- PASO 1: SOLICITAR CÓDIGO ---
  const handleRequestCode = async () => {
    setError('');
    setSuccessMsg('');

    // Validaciones antes de enviar código
    if (!validateEmail(email)) {
        setError('Correo inválido (Revise formato matrícula o dominio @utparral.edu.mx)');
        return;
    }
    if (!fullName.trim()) {
        setError('El nombre completo es requerido.');
        return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
        setError(passwordError);
        return;
    }
    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
    }

    setIsLoading(true);

    try {
        // Asegúrate de que tu backend tenga este endpoint configurado
        const response = await fetch('https://utproyex.ddns.net:4000/api/auth/request-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al solicitar código');
        }

        // Si todo sale bien, pasamos al paso 2
        setSuccessMsg(`El código enviado expira en 10 minutos`);
        setShowVerificationStep(true);

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error de conexión.');
    } finally {
        setIsLoading(false);
    }
  };

  // --- PASO 2: VERIFICAR Y REGISTRAR ---
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (verificationCode.length < 6) {
        setError('El código debe tener 6 dígitos.');
        return;
    }

    setIsLoading(true);

    try {
        const response = await fetch('https://utproyex.ddns.net:4000/api/auth/verify-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName,
                email,
                password,
                code: verificationCode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
        }

        alert('¡Cuenta creada exitosamente!');
        onRegister(data.user);

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al registrar.');
    } finally {
        setIsLoading(false);
    }
  };

  // --- LOGIN NORMAL ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const response = await fetch('https://utproyex.ddns.net:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Credenciales incorrectas');
        }

        onLogin(data.user);

    } catch (err: any) {
        setError(err.message || 'Error de conexión');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-100 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* HEADER */}
        <div className="flex flex-col items-center">
          <img src={Logo} alt="Logo" className="w-24 h-24 object-contain" />
          <h2 className="mt-4 text-3xl font-extrabold text-center text-gray-900">
            {isLogin 
                ? 'Inicia Sesión' 
                : (showVerificationStep ? 'Verificar Correo' : 'Crea tu Cuenta')}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            {isLogin ? ' Para acceder a tu repositorio' : 'Únete al repositorio de proyectos'}
          </p>
        </div>

        {/* FORMULARIO */}
        <form className="space-y-4" onSubmit={isLogin ? handleLoginSubmit : handleVerifyAndRegister}>
          
         {/* MODO REGISTRO: PASO 1 (Datos) */}
          {!isLogin && !showVerificationStep && (
            <>
                <div>
                    <label htmlFor="register-name" className="text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input 
                        id="register-name"
                        name="fullName"
                        autoComplete="name" // Indica que es el nombre completo
                        type="text" 
                        required 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="Tu nombre completo" 
                    />
                </div>
                <div>
                    <label htmlFor="register-email" className="text-sm font-medium text-gray-700">Correo Institucional</label>
                    <input 
                        id="register-email"
                        name="email"
                        autoComplete="email" // Indica que es un correo nuevo
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="correo@utparral.edu.mx" 
                    />
                    {/* Aquí puedes agregar el texto de ayuda si lo deseas */}
                </div>
                <div>
                    <label htmlFor="register-password" className="text-sm font-medium text-gray-700">Contraseña</label>
                    <input 
                        id="register-password"
                        name="password"
                        autoComplete="new-password" // CRUCIAL: Indica que es una contraseña NUEVA
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="********" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Debe tener al menos 8 caracteres y una mayúscula</p>
                </div>
                <div>
                    <label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                    <input 
                        id="register-confirm-password"
                        name="confirmPassword"
                        autoComplete="new-password" // También se marca como new-password
                        type="password" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="********"
                    />
                </div>
            </>
          )}

          {/* MODO LOGIN */}
          {isLogin && (
            <>
                <div>
                    <label htmlFor="login-email" className="text-sm font-medium text-gray-700">Correo</label>
                    <input 
                        id="login-email"           // Ayuda al navegador a identificar el campo
                        name="email"               // Obligatorio para el autocompletado
                        type="email" 
                        autoComplete="username"    // Le dice al navegador: "Este es el usuario guardado"
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="correo@utparral.edu.mx"
                    />
                </div>
                <div>
                    <label htmlFor="login-password" className="text-sm font-medium text-gray-700">Contraseña</label>
                    <input 
                        id="login-password"        // Identificador único
                        name="password"            // Obligatorio
                        type="password" 
                        autoComplete="current-password" // Le dice al navegador: "Esta es la contraseña actual"
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                        placeholder="********"
                    />
                </div>
            </>
          )}

          {/* MODO REGISTRO: PASO 2 (Código) */}
          {!isLogin && showVerificationStep && (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 space-y-3">
                  <p className="text-sm text-emerald-800 text-center">
                      Hemos enviado un código de verificación a: <br/><strong>{email}</strong>
                  </p>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1 text-center">Código de 6 dígitos</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        required 
                        value={verificationCode} 
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,''))} // Solo números
                        className="w-full px-3 py-3 border-2 border-emerald-500 rounded-md text-center text-2xl tracking-widest font-mono focus:outline-none" 
                        placeholder="000000"
                      />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Revisa tu bandeja de entrada o spam.</p>
              </div>
          )}

          {/* Mensajes de Feedback */}
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200 text-center">{error}</div>}
          {successMsg && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md border border-green-200 text-center">{successMsg}</div>}

          {/* BOTONES DE ACCIÓN */}
          <div>
            {!isLogin && !showVerificationStep ? (
                // Botón Paso 1: Solicitar Código
                <button 
                    type="button" 
                    onClick={handleRequestCode} 
                    disabled={isLoading} 
                    className="w-full px-5 py-3 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
                >
                    {isLoading ? 'Enviando...' : 'Enviar Código de Verificación'}
                </button>
            ) : (
                // Botón Login o Paso 2 (Confirmar)
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full px-5 py-3 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
                >
                    {isLoading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Verificar y Registrarse')}
                </button>
            )}
          </div>
        </form>

        {/* CAMBIAR MODO */}
        <div className="text-sm text-center text-gray-600">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              // Resetear todos los estados al cambiar
              setShowVerificationStep(false);
              setError('');
              setSuccessMsg('');
              setFullName('');
              setPassword('');
              setConfirmPassword('');
              setVerificationCode('');
            }}
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 focus:outline-none hover:underline"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;