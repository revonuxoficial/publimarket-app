'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { requestPasswordReset, AuthFormState } from '@/app/actions/auth'; // Importar la acción
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

const initialState: AuthFormState = {
  message: '',
  type: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70"
    >
      {pending && <LoadingSpinner size="sm" message="" color="border-white" />}
      {pending ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
    </button>
  );
}

export default function RequestResetForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && state.type === 'error' && (
        <ErrorMessage message={state.message} />
      )}
      {state?.message && state.type === 'success' && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {state.message}
        </div>
      )}

      {!state?.type || state.type === 'error' ? ( // Solo mostrar el formulario si no hay mensaje de éxito
        <>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              aria-describedby="email-error"
            />
            {state?.issues && <p id="email-error" className="mt-1 text-xs text-red-500">{state.issues.join(', ')}</p>}
          </div>
          <div>
            <SubmitButton />
          </div>
        </>
      ) : null}
    </form>
  );
}
