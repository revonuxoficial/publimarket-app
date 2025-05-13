import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sobre Nosotros - PubliMarket',
  description: 'Conocé más sobre PubliMarket, tu marketplace local para conectar con vendedores y encontrar productos únicos.',
};

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
          Sobre PubliMarket
        </h1>
        <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
          Conectando comunidades locales, un producto a la vez.
        </p>
      </header>

      <div className="prose prose-lg sm:prose-xl max-w-4xl mx-auto text-slate-700 space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-slate-800 border-b pb-2 mb-4">Nuestra Misión</h2>
          <p>
            En PubliMarket, nuestra misión es revitalizar el comercio local facilitando conexiones directas y significativas
            entre compradores y vendedores dentro de su propia comunidad. Creemos en el poder de lo local y en la
            importancia de apoyar a los emprendedores y pequeños negocios que dan vida a nuestros barrios.
          </p>
          <p>
            Buscamos ser la plataforma de referencia donde encontrar productos y servicios únicos, de calidad y cercanos,
            fomentando una economía circular y sostenible.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-800 border-b pb-2 mb-4">¿Cómo Funciona PubliMarket?</h2>
          <p>
            PubliMarket se distingue por su simplicidad y enfoque en la comunicación directa:
          </p>
          <ol>
            <li>
              <strong>Explorá y Descubrí:</strong> Navegá por una amplia variedad de productos y servicios ofrecidos por vendedores de tu zona. Utilizá nuestros filtros de búsqueda para encontrar exactamente lo que necesitás.
            </li>
            <li>
              <strong>Conectá Directo por WhatsApp:</strong> ¿Te interesa un producto? Hacé clic en el botón de WhatsApp para iniciar una conversación directa con el vendedor. Sin intermediarios, sin comisiones ocultas.
            </li>
            <li>
              <strong>Acordá los Detalles:</strong> Coordiná directamente con el vendedor los detalles de la compra, el pago y la entrega o retiro del producto. PubliMarket no interviene en esta etapa, dándote total libertad y flexibilidad.
            </li>
          </ol>
          <p>
            Este modelo permite una interacción más personal y eficiente, adaptada a las necesidades de cada transacción.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-800 border-b pb-2 mb-4">Beneficios para Compradores</h2>
          <ul>
            <li>Acceso a una gran variedad de productos y servicios locales.</li>
            <li>Descubrimiento de ofertas únicas y emprendedores de tu comunidad.</li>
            <li>Comunicación directa y rápida con los vendedores.</li>
            <li>Flexibilidad para acordar pagos y entregas.</li>
            <li>Apoyo al comercio local y a la economía de tu barrio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-800 border-b pb-2 mb-4">Beneficios para Vendedores</h2>
          <ul>
            <li>Una vidriera digital para llegar a más clientes en tu área.</li>
            <li>Plataforma fácil de usar para publicar y gestionar tus productos.</li>
            <li>Contacto directo con interesados a través de WhatsApp, facilitando cierres de venta.</li>
            <li>Sin comisiones por venta (según el plan de PubliMarket).</li>
            <li>Herramientas para destacar tu negocio y construir tu marca local.</li>
          </ul>
        </section>

        <section className="text-center mt-12 py-8 bg-slate-50 rounded-lg">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">¿Listo para Empezar?</h2>
          <p className="mb-6 text-lg text-slate-600">
            Ya sea que busques comprar o vender, PubliMarket es tu aliado local.
          </p>
          <div className="space-x-4">
            <Link
              href="/productos"
              className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg"
            >
              Explorar Productos
            </Link>
            <Link
              href="/auth#register" // Asumiendo que /auth maneja el tab de registro
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg"
            >
              Registrar mi Tienda
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
