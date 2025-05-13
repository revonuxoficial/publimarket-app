import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad - PubliMarket',
  description: 'Conocé cómo PubliMarket maneja y protege tu información personal.',
};

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </p>
      </header>

      <div className="prose prose-lg max-w-4xl mx-auto text-slate-700 space-y-6">
        <p>
          En PubliMarket (en adelante, "la Plataforma"), valoramos tu privacidad y nos comprometemos a proteger
          tu información personal. Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos
          información cuando utilizás nuestros servicios.
        </p>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">1. Información que Recopilamos</h2>
          <p>
            Podemos recopilar la siguiente información:
          </p>
          <ul>
            <li>
              <strong>Información de Registro:</strong> Cuando creás una cuenta, recopilamos tu nombre, dirección de correo electrónico y contraseña (hasheada). Si te registrás como vendedor, también podemos solicitar información adicional sobre tu negocio.
            </li>
            <li>
              <strong>Información de Perfil:</strong> Información que proporcionás para tu perfil de usuario o perfil de vendedor, como nombre de la tienda, descripción, logo, número de WhatsApp, enlaces a redes sociales, horarios y ubicación.
            </li>
            <li>
              <strong>Contenido Publicado:</strong> Información sobre los productos o servicios que publicás, incluyendo descripciones, precios e imágenes.
            </li>
            <li>
              <strong>Información de Uso:</strong> Recopilamos información sobre cómo interactuás con la Plataforma, como las páginas que visitás, las búsquedas que realizás y tus productos favoritos. Esto puede incluir datos técnicos como tu dirección IP, tipo de navegador y sistema operativo.
            </li>
            <li>
              <strong>Comunicaciones:</strong> Si te ponés en contacto con nosotros, podemos guardar un registro de esa comunicación.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">2. Cómo Usamos tu Información</h2>
          <p>
            Utilizamos la información que recopilamos para:
          </p>
          <ul>
            <li>Proveer, operar y mantener la Plataforma.</li>
            <li>Permitir la comunicación entre Compradores y Vendedores.</li>
            <li>Personalizar y mejorar tu experiencia en la Plataforma.</li>
            <li>Procesar tu registro y gestionar tu cuenta.</li>
            <li>Enviarte comunicaciones relacionadas con el servicio, actualizaciones y ofertas (con tu consentimiento cuando sea necesario).</li>
            <li>Analizar el uso de la Plataforma para mejorar nuestros servicios.</li>
            <li>Prevenir fraudes y garantizar la seguridad de la Plataforma.</li>
            <li>Cumplir con obligaciones legales.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">3. Cómo Compartimos tu Información</h2>
          <p>
            No vendemos tu información personal a terceros. Podemos compartir tu información en las siguientes circunstancias:
          </p>
          <ul>
            <li>
              <strong>Con Vendedores/Compradores:</strong> La información de tu perfil de vendedor (nombre de tienda, contacto, etc.) y de tus productos es visible públicamente. Cuando iniciás contacto vía WhatsApp, tu número será visible para la otra parte.
            </li>
            <li>
              <strong>Proveedores de Servicios:</strong> Podemos compartir información con terceros que nos prestan servicios (ej. hosting, análisis de datos, envío de correos), pero solo la necesaria para que realicen sus funciones y bajo acuerdos de confidencialidad.
            </li>
            <li>
              <strong>Requisitos Legales:</strong> Podemos divulgar tu información si así lo exige la ley o en respuesta a solicitudes válidas de autoridades públicas.
            </li>
            <li>
              <strong>Transferencias Comerciales:</strong> En caso de fusión, adquisición o venta de activos, tu información podría ser transferida.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">4. Seguridad de tu Información</h2>
          <p>
            Tomamos medidas razonables para proteger tu información personal contra pérdida, robo, uso indebido y acceso no autorizado. Sin embargo, ninguna transmisión por Internet o sistema de almacenamiento es 100% seguro.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">5. Tus Derechos y Opciones</h2>
          <p>
            Tenés derecho a acceder, corregir o eliminar tu información personal. Podés gestionar la información de tu perfil y productos a través de tu panel de control. Para otras solicitudes, contactanos.
          </p>
          <p>
            Podés optar por no recibir comunicaciones promocionales siguiendo las instrucciones de cancelación de suscripción en dichos mensajes.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-slate-800">6. Cookies y Tecnologías Similares</h2>
          <p>
            Utilizamos cookies y tecnologías similares para mejorar la funcionalidad de la Plataforma, recordar tus preferencias y analizar el tráfico. Podés configurar tu navegador para rechazar cookies, pero esto podría afectar algunas funcionalidades.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">7. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos publicando la nueva política en la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">8. Contacto</h2>
          <p>
            Si tenés alguna pregunta sobre esta Política de Privacidad, por favor <Link href="/contacto" className="text-sky-600 hover:underline">contactanos</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
