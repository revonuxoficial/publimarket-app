import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Importa los estilos globales de TailwindCSS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PubliMarket", // Título basado en el brief
  description: "Marketplace Local con Conversión Directa", // Descripción basada en el brief
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Idioma en español según reglas */}
      <html lang="es">
        <body className={`flex flex-col min-h-screen ${inter.className}`} > {/* Flexbox para layout, min-h-screen para ocupar toda la altura */}
          {/* Placeholder para el Header */}
          <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            {/* Aquí irá el contenido del Header (Logo, Navegación, Buscador) */}
            <p>[Placeholder para Header]</p>
          </div>
        </header>

        {/* Contenido principal de la aplicación */}
        <main className="flex-grow container mx-auto p-4"> {/* flex-grow para ocupar espacio disponible, container y mx-auto para centrar y limitar ancho */}
          {children}
        </main>

        {/* Placeholder para el Footer */}
        <footer className="bg-gray-800 text-white p-4 mt-auto"> {/* mt-auto para empujar el footer al final */}
          <div className="container mx-auto text-center">
            {/* Aquí irá el contenido del Footer (Links, Info de Contacto, Copyright) */}
            <p>[Placeholder para Footer]</p>
          </div>
        </footer>
      </body>
    </html>
    </>
  );
}
