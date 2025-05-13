import React from 'react';
import RequestResetForm from '@/components/auth/RequestResetForm';
import Link from 'next/link';

export const metadata = {
  title: 'Recuperar Contraseña - PubliMarket',
  description: 'Solicitá un enlace para restablecer tu contraseña de PubliMarket.',
};

export default function RecuperarContrasenaPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8"> {/* Ajustar min-h si es necesario */}
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
        <RequestResetForm />
        <div className="text-sm text-center">
          <Link href="/auth" className="font-medium text-sky-600 hover:text-sky-500">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
