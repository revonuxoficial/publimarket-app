import React from 'react';
import Link from 'next/link'; // Importar Link

export const metadata = {
  title: 'Términos y Condiciones - PubliMarket',
  description: 'Leé los términos y condiciones de uso de la plataforma PubliMarket.',
};

export default function TerminosPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
          Términos y Condiciones de Uso
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Última actualización: {new Date().toLocaleDateString('es-AR')}
        </p>
      </header>

      <div className="prose prose-lg max-w-4xl mx-auto text-slate-700 space-y-6">
        <p>
          Bienvenido a PubliMarket (en adelante, "la Plataforma"). Estos Términos y Condiciones de Uso
          (en adelante, "Términos") rigen tu acceso y uso de la Plataforma y sus servicios.
          Al acceder o utilizar PubliMarket, aceptás cumplir con estos Términos. Si no estás de acuerdo,
          no utilices la Plataforma.
        </p>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">1. Descripción del Servicio</h2>
          <p>
            PubliMarket es un marketplace local que facilita la conexión directa entre Vendedores
            (usuarios que ofrecen productos o servicios) y Compradores (usuarios que buscan productos o servicios)
            principalmente a través de la mensajería instantánea WhatsApp. PubliMarket no participa
            en las transacciones, pagos, envíos ni garantías de los productos o servicios ofrecidos,
            siendo estos responsabilidad exclusiva de los Vendedores y Compradores.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">2. Cuentas de Usuario</h2>
          <p>
            Para utilizar ciertas funcionalidades, como publicar productos (Vendedores) o guardar favoritos (Compradores),
            es necesario registrarse y crear una cuenta. Sos responsable de mantener la confidencialidad
            de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.
          </p>
          <p>
            Debes proporcionar información precisa y actualizada. PubliMarket se reserva el derecho de suspender
            o cancelar cuentas que infrinjan estos Términos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">3. Conducta del Usuario y Contenido</h2>
          <p>
            Como Vendedor, te comprometés a:
          </p>
          <ul>
            <li>Proporcionar información veraz y detallada sobre tus productos/servicios.</li>
            <li>No publicar contenido ilegal, fraudulento, engañoso, difamatorio, obsceno o que infrinja derechos de terceros.</li>
            <li>Respetar las leyes y regulaciones aplicables a tu actividad comercial.</li>
            <li>Gestionar de forma responsable las consultas y transacciones con los Compradores.</li>
          </ul>
          <p>
            Como Comprador, te comprometés a utilizar la plataforma de buena fe y a interactuar respetuosamente con los Vendedores.
          </p>
          <p>
            PubliMarket no se responsabiliza por el contenido publicado por los usuarios ni por las interacciones
            entre Vendedores y Compradores. Sin embargo, nos reservamos el derecho de eliminar contenido o cuentas
            que violen estos Términos o las políticas de la comunidad.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">4. Propiedad Intelectual</h2>
          <p>
            El contenido de la Plataforma, incluyendo logos, diseño, texto, gráficos (excluyendo el contenido
            generado por el usuario) es propiedad de PubliMarket o sus licenciantes y está protegido por
            leyes de propiedad intelectual.
          </p>
          <p>
            Al publicar contenido en PubliMarket, otorgás a la Plataforma una licencia no exclusiva, mundial,
            libre de regalías para usar, reproducir, modificar y mostrar dicho contenido en relación con
            la prestación de los servicios de la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">5. Limitación de Responsabilidad</h2>
          <p>
            PubliMarket se proporciona "tal cual" y "según disponibilidad". No garantizamos que la Plataforma
            sea ininterrumpida, segura o libre de errores. En la máxima medida permitida por la ley,
            PubliMarket no será responsable por daños directos, indirectos, incidentales, especiales o
            consecuentes que surjan del uso o la incapacidad de usar la Plataforma.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold text-slate-800">6. Modificaciones a los Términos</h2>
          <p>
            PubliMarket se reserva el derecho de modificar estos Términos en cualquier momento. Te notificaremos
            sobre cambios importantes. El uso continuado de la Plataforma después de dichas modificaciones
            constituirá tu aceptación de los nuevos Términos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">7. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos Términos se regirán e interpretarán de acuerdo con las leyes de Argentina. Cualquier disputa
            que surja en relación con estos Términos estará sujeta a la jurisdicción exclusiva de los tribunales
            de la Ciudad Autónoma de Buenos Aires, Argentina.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800">8. Contacto</h2>
          <p>
            Si tenés alguna pregunta sobre estos Términos, por favor <Link href="/contacto" className="text-sky-600 hover:underline">contactanos</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
