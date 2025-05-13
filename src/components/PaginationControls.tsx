'use client'; // Necesita ser un Client Component si usa hooks como useSearchParams, pero aquí construiremos URLs

import Link from 'next/link';
import React from 'react';

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // Ej: "/productos", "/admin/usuarios"
  searchParams?: Record<string, string | string[] | undefined>; // Para mantener otros query params
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}) => {
  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página o ninguna
  }

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    if (pageNumber > 1) {
      params.set('page', String(pageNumber));
    } else {
      params.delete('page'); // No añadir page=1 a la URL
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav className="flex justify-center items-center space-x-3" aria-label="Paginación">
      <Link
        href={createPageURL(prevPage)}
        className={`inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors ${
          currentPage <= 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
        aria-disabled={currentPage <= 1}
        scroll={false} // Evitar scroll al inicio de la página al cambiar de página
      >
        <ChevronLeftIcon />
        <span className="ml-2">Anterior</span>
      </Link>
      
      <span className="text-sm text-slate-700 bg-slate-100 px-4 py-2.5 rounded-md">
        Página {currentPage} de {totalPages}
      </span>
      
      <Link
        href={createPageURL(nextPage)}
        className={`inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors ${
          currentPage >= totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
        aria-disabled={currentPage >= totalPages}
        scroll={false}
      >
        <span className="mr-2">Siguiente</span>
        <ChevronRightIcon />
      </Link>
    </nav>
  );
};

export default PaginationControls;
