import React, { Suspense } from 'react';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export const metadata = {
  title: 'Actualizar Contraseña - PubliMarket',
  description: 'Establecé una nueva contraseña para tu cuenta de PubliMarket.',
};

// Este componente es necesario para que `searchParams` esté disponible en el Server Component
// y para que la página se renderice dinámicamente si es necesario para el flujo de Supabase.
function ActualizarContrasenaContent() {
  return <UpdatePasswordForm />;
}

export default function ActualizarContrasenaPage() {
  // La lógica de Supabase para manejar el token de la URL (si es necesario)
  // se activa al acceder a esta ruta si está configurada como redirectTo.
  // El componente `UpdatePasswordForm` luego llama a `updateUserPassword`
  // que opera sobre la sesión de usuario (que Supabase debería haber establecido
  // temporalmente para el restablecimiento).

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Actualizar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Ingresá tu nueva contraseña.
          </p>
        </div>
        {/* Suspense es útil si UpdatePasswordForm hiciera alguna carga de datos, aunque aquí es principalmente para el estado del formulario */}
        <Suspense fallback={<LoadingSpinner message="Cargando formulario..." />}>
          <ActualizarContrasenaContent />
        </Suspense>
        <div className="text-sm text-center mt-4">
          <Link href="/auth" className="font-medium text-sky-600 hover:text-sky-500">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
