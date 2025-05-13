import React from 'react';
import ContactForm from '@/components/ContactForm'; // Ajustar ruta si ContactForm está en otra ubicación

export const metadata = {
  title: 'Contacto - PubliMarket',
  description: 'Ponete en contacto con el equipo de PubliMarket. Envianos tus consultas, sugerencias o comentarios.',
};

export default function ContactoPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
          Contactanos
        </h1>
        <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
          ¿Tenés alguna pregunta, sugerencia o comentario? Nos encantaría escucharte.
        </p>
      </header>

      <ContactForm />

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Otra Información de Contacto</h2>
        <p className="text-slate-600">
          Si preferís otros medios, también podés encontrarnos en:
        </p>
        <div className="mt-4 space-y-2 text-slate-500">
          {/* <p><strong>Email:</strong> soporte@publimarket.com (Ejemplo)</p> */}
          {/* <p><strong>Teléfono:</strong> +54 9 11 XXXX-XXXX (Ejemplo)</p> */}
          <p>Próximamente más canales de contacto.</p>
        </div>
      </section>
    </div>
  );
}
