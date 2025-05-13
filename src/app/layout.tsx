import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Importa los estilos globales de TailwindCSS
import Header from "@/components/Header"; // Importar el componente Header
import Link from 'next/link'; // Importar Link

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PubliMarket", // Título basado en el brief
  description: "Marketplace Local con Conversión Directa", // Descripción basada en el brief
  manifest: "/manifest.json", // Enlace al manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Idioma en español según reglas */}
      <html lang="es" className="h-full">
        <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased`}>
          <Header /> {/* Usar el componente Header */}

          {/* Contenido principal de la aplicación */}
          {/* Se quitaron 'container' y 'mx-auto' para permitir secciones full-width */}
          {/* Eliminar padding horizontal para que el contenido pueda ser full-width */}
          <main className="flex-grow py-8">
            {children}
          </main>

          {/* Footer estilizado */}
          <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <nav className="flex justify-center space-x-4 mb-4">
                <Link href="/sobre-nosotros" className="hover:text-sky-400 transition-colors">Sobre Nosotros</Link>
                <Link href="/contacto" className="hover:text-sky-400 transition-colors">Contacto</Link>
                <Link href="/terminos" className="hover:text-sky-400 transition-colors">Términos y Condiciones</Link>
                <Link href="/privacidad" className="hover:text-sky-400 transition-colors">Política de Privacidad</Link>
              </nav>
              <p>&copy; {new Date().getFullYear()} PubliMarket. Todos los derechos reservados.</p>
            </div>
          </footer>
        </body>
      </html>
    </>
  );
}
