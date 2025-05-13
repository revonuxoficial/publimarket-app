'use client';

'use client'; // Asegurarse que está al inicio

import React, { useState, useEffect, useActionState } from 'react'; // Añadir useActionState de 'react'
import { useFormStatus } from 'react-dom'; // useFormStatus sigue siendo de 'react-dom'
import { handleAuth, AuthFormState } from '@/app/actions/auth'; // Importar AuthFormState
import { createClient } from '@/lib/supabaseClient'; // Usar el cliente unificado de @supabase/ssr
import { type Database } from '@/lib/supabase'; // Importar tipos de DB
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link'; // Para el logo

// Íconos para los campos (opcional)
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const initialState: AuthFormState = {
  message: '',
  type: undefined,
};

function SubmitButton({ mode }: { mode: 'login' | 'register' }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white transition-colors duration-150 ease-in-out ${
        pending 
          ? 'bg-sky-400 cursor-not-allowed' 
          : 'bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500'
      }`}
    >
      {pending ? (
        <LoadingSpinner size="sm" message="" color="border-white" />
      ) : (
        mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
      )}
    </button>
  );
}

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // Usar useActionState en lugar de useFormState
  const [state, formAction] = useActionState(handleAuth, initialState); 
  const router = useRouter();

  // Para limpiar los campos de email y password al cambiar de modo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nuevo estado para confirmar contraseña
  const [clientError, setClientError] = useState<string | null>(null); // Para errores de validación del cliente

  useEffect(() => {
    // La redirección post-login ahora es manejada por la Server Action.
    // Este useEffect solo manejará la redirección post-registro.
    if (state?.type === 'success' && mode === 'register') {
      const timer = setTimeout(() => {
        router.push('/auth?message=Revisa tu email para confirmar el registro');
      }, 1500); // Dar tiempo para leer el mensaje de éxito
      return () => clearTimeout(timer);
    }
    // No es necesario limpiar el estado aquí ya que la redirección de la SA recargará.
  }, [state, mode, router]);

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    // Resetear el estado del formulario al cambiar de modo
    // Esto no es directamente posible con useFormState sin un key en el form o un wrapper.
    // Por ahora, el mensaje de estado persistirá si no se limpia explícitamente.
    // Para una mejor UX, se podría resetear el 'state' o forzar un remount del form.
    // Limpiamos los campos controlados:
    setEmail('');
    setPassword('');
    setConfirmPassword(''); // Limpiar también confirmPassword
    setClientError(null); // Limpiar errores de cliente
    // No podemos resetear 'state' directamente aquí, pero el usuario verá campos vacíos.
  };
  
  const localHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    if (mode === 'register' && password !== confirmPassword) {
      event.preventDefault(); // Prevenir el envío del formulario si las contraseñas no coinciden
      setClientError('Las contraseñas no coinciden.');
      return;
    }
    // Si las contraseñas coinciden (o es login), se permite que formAction (de useFormState) continúe.
    // No es necesario llamar a formAction() explícitamente aquí si el form tiene action={formAction}
  };

  return (
    <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-2xl border border-slate-200">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-sky-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
        </Link>
        <h2 className="text-3xl font-bold text-slate-800">
          {mode === 'login' ? 'Bienvenido de Nuevo' : 'Crear Cuenta'}
        </h2>
        <p className="text-slate-500 mt-2">
          {mode === 'login' ? 'Ingresá tus credenciales para acceder.' : 'Completá tus datos para unirte.'}
        </p>
      </div>

      {state?.message && state.type === 'error' && (
        <div className="mb-4">
          <ErrorMessage message={state.message} title={mode === 'login' ? 'Error de Inicio de Sesión' : 'Error de Registro'} />
        </div>
      )}
      {state?.message && state.type === 'success' && (
        <div className="p-4 mb-4 text-sm rounded-lg bg-green-50 border border-green-300 text-green-700 shadow" role="alert">
          <p className="font-semibold">¡Éxito!</p>
          {state.message}
        </div>
      )}
      {clientError && (
         <div className="mb-4">
           <ErrorMessage message={clientError} title="Error de Validación" />
         </div>
      )}

      <form 
        action={(formData) => {
          if (mode === 'register' && password !== confirmPassword) {
            setClientError('Las contraseñas no coinciden.');
            // No llamar a formAction si hay error de cliente
            return; 
          }
          setClientError(null);
          formAction(formData);
        }} 
        className="space-y-6"
      >
        <input type="hidden" name="action" value={mode} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EmailIcon />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email} // Controlado
              onChange={(e) => setEmail(e.target.value)} // Controlado
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
              placeholder="tu@email.com"
            />
             {/* handleAuth actualmente no devuelve errores de campo en 'issues'. Si se añade Zod a handleAuth, esto se puede reactivar. */}
             {/* {state?.issues?.email && <p className="mt-1 text-xs text-red-500">{state.issues.email[0]}</p>} */}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? "current-password" : "new-password"}
              required
              value={password} // Controlado
              onChange={(e) => setPassword(e.target.value)} // Controlado
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
              placeholder="••••••••"
            />
            {/* handleAuth actualmente no devuelve errores de campo en 'issues'. Si se añade Zod a handleAuth, esto se puede reactivar. */}
            {/* {state?.issues?.password && <p className="mt-1 text-xs text-red-500">{state.issues.password[0]}</p>} */}
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required={mode === 'register'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
        )}
        
        <SubmitButton mode={mode} />
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          {mode === 'login' ? '¿Aún no tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <button
            type="button"
            className="ml-1 font-semibold text-sky-600 hover:text-sky-500 hover:underline focus:outline-none"
            onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Regístrate aquí' : 'Inicia Sesión aquí'}
          </button>
        </p>
        {mode === 'login' && (
          <div className="mt-2">
            <Link href="/auth/recuperar-contrasena" className="text-sm font-medium text-sky-600 hover:text-sky-500 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
