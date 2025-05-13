'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Para la búsqueda
import AuthStatus from './AuthStatus';

// Íconos
const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sky-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const SellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Cerrar menú móvil si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);


  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-sky-600 hover:text-sky-700 transition-colors">
              <LogoIcon />
              <span className="hidden sm:inline">PubliMarket</span>
            </Link>
          </div>

          {/* Barra de Búsqueda (Desktop) */}
          <div className="flex-grow mx-4 hidden md:block"> {/* Oculto en móvil, visible en desktop */}
             <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos, servicios, tiendas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-full text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ease-in-out bg-slate-100 hover:bg-slate-200"
                />
             </form>
          </div>


          {/* Acciones Derecha (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            <AuthStatus />
            <Link href="/vendedor/productos/nuevo" className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center">
              <SellIcon />
              Vender
            </Link>
          </div>

          {/* Lado Derecho Móvil (Icono de Búsqueda y Hamburguesa) */}
          <div className="md:hidden flex items-center space-x-2">
             {/* Icono de búsqueda para móvil - expandirá la barra en el menú */}
             {/* Por ahora, solo un icono, la funcionalidad de expansión se puede añadir después */}
             {/* Se elimina el botón de búsqueda duplicado en móvil, ya que la barra está en el menú */}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="p-2 rounded-md text-slate-500 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menú</span>
              {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Menú Móvil */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-xl z-40 transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'} overflow-y-auto`}
      >
        <div className="px-4 pt-4 pb-4 space-y-4"> {/* Ajustar padding y espaciado */}
          {/* Barra de búsqueda en el menú móvil */}
           <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Buscar productos, servicios, tiendas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-full text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 ease-in-out bg-slate-100 hover:bg-slate-200"
              />
           </form>

          {/* Enlaces de navegación en el menú móvil */}
          <Link href="/productos" className="text-slate-700 hover:bg-slate-100 hover:text-sky-600 block px-3 py-2.5 rounded-md text-base font-medium transition-colors" onClick={toggleMobileMenu}>
            Productos
          </Link>

          {/* Acciones en el menú móvil */}
          <div className="border-t border-slate-100 pt-4 mt-4 space-y-4"> {/* Ajustar padding y espaciado */}
            <Link href="/vendedor/productos/nuevo" className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-full text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200 ease-in-out" onClick={toggleMobileMenu}>
              <SellIcon />
              Vender
            </Link>
            <div className="px-1 py-2"> {/* Mantener este div para AuthStatus si es necesario para el layout interno */}
              {/* AuthStatus aquí dentro del menú móvil */}
              <AuthStatus />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
