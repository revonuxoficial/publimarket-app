'use client';

import React, { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { sendContactMessage, ContactFormState } from '@/app/actions/contact';
import ErrorMessage from './ErrorMessage'; // Asumiendo que ErrorMessage puede mostrar un string simple
import LoadingSpinner from './LoadingSpinner';

const initialState: ContactFormState = {
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
      {pending ? 'Enviando...' : 'Enviar Mensaje'}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(sendContactMessage, initialState);

  // Opcional: resetear formulario si el mensaje fue exitoso
  // Esto requeriría que el formulario sea controlado o usar refs.
  // Por simplicidad con useFormState, el formulario no se resetea automáticamente.
  // useEffect(() => {
  //   if (state?.type === 'success') {
  //     // Lógica para resetear el formulario aquí, si es necesario
  //     // e.g., (document.getElementById('contact-form') as HTMLFormElement)?.reset();
  //   }
  // }, [state]);

  return (
    <form action={formAction} className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-slate-200" id="contact-form">
      {state?.message && state.type === 'error' && (
        <ErrorMessage message={state.message} />
      )}
      {state?.message && state.type === 'success' && (
        <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nombre Completo
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          aria-describedby="name-error"
        />
        {state?.issues?.name && <p id="name-error" className="mt-1 text-xs text-red-500">{state.issues.name[0]}</p>} {/* Mostrar solo el primer error del campo */}
      </div>

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
        {state?.issues?.email && <p id="email-error" className="mt-1 text-xs text-red-500">{state.issues.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
          Asunto
        </label>
        <input
          type="text"
          name="subject"
          id="subject"
          required
          className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          aria-describedby="subject-error"
        />
        {state?.issues?.subject && <p id="subject-error" className="mt-1 text-xs text-red-500">{state.issues.subject[0]}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700">
          Mensaje
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          required
          className="mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          aria-describedby="message-error"
        ></textarea>
        {state?.issues?.message && <p id="message-error" className="mt-1 text-xs text-red-500">{state.issues.message[0]}</p>}
      </div>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
