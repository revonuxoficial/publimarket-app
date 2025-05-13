'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Definición del ícono directamente aquí
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
);

// Hook de debounce
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface ProductFiltersFormProps {
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string; // Este initialCategory será el slug
  initialSortBy?: string;
  uniqueCategories: Array<{ id: string; name: string; slug: string; }>; // Actualizado el tipo
  uniqueCities: string[];
}

export default function ProductFiltersForm({
  initialQuery = '',
  initialCity = '',
  initialCategory = '',
  initialSortBy = 'date_desc',
  uniqueCategories,
  uniqueCities,
}: ProductFiltersFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSortBy);
  // Nuevo estado para el filtro de Vendedores PRO
  const [onlyProVendors, setOnlyProVendors] = useState(searchParams.get('onlyProVendors') === 'true');


  const debouncedQuery = useDebounce(query, 500); // 500ms delay

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string>) => {
      const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(paramsToUpdate).forEach(([name, value]) => {
        if (value) {
          currentParams.set(name, value);
        } else {
          currentParams.delete(name);
        }
      });
      return currentParams.toString();
    },
    [searchParams]
  );

  // Efecto para la búsqueda por palabra clave (debounced)
  useEffect(() => {
    // Solo actualizar si el query debounced es diferente del initialQuery o si no es el primer render con el mismo valor
    // O más simple: siempre actualizar si el debouncedQuery cambia respecto al searchParam actual
    const currentQueryParam = searchParams.get('query') || '';
    if (debouncedQuery !== currentQueryParam) {
      const queryString = createQueryString({ query: debouncedQuery, page: '' }); // Reset page on new query
      router.push(`${pathname}?${queryString}`, { scroll: false });
    }
  }, [debouncedQuery, pathname, router, createQueryString, searchParams]);

  // Manejar el envío del formulario para los otros filtros (ciudad, categoría, sort)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const paramsToUpdate: Record<string, string> = {};
    if (city !== (searchParams.get('city') || '')) paramsToUpdate.city = city;
    if (category !== (searchParams.get('category') || '')) paramsToUpdate.category = category;
    if (sortBy !== (searchParams.get('sort') || 'date_desc')) paramsToUpdate.sort = sortBy;
    // Incluir el estado del filtro de Vendedores PRO
    const currentOnlyProVendorsParam = searchParams.get('onlyProVendors') === 'true';
    if (onlyProVendors !== currentOnlyProVendorsParam) {
        paramsToUpdate.onlyProVendors = onlyProVendors ? 'true' : ''; // Usar '' para eliminar el parámetro si es false
    }
    
    // Si solo el query cambió y ya fue manejado por debounce, no hacer nada extra aquí
    // Pero si otros filtros cambiaron, necesitamos actualizar.
    // Siempre reseteamos la página a 1 cuando se aplican filtros manualmente.
    paramsToUpdate.page = ''; 
    
    const queryString = createQueryString(paramsToUpdate);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };


  return (
    <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
        <div className="lg:col-span-2">
          <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-1">Buscar por palabra clave</label>
          <input
            type="text"
            name="query"
            id="query"
            placeholder="Ej: Zapatillas deportivas, Taller mecánico"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
          />
        </div>
        <div>
          {/* Filtro por ubicación */}
          <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar por ubicación (opcional)</label>
          <div className="flex flex-col gap-2">
            <input
              type="number"
              step="any"
              name="latitude"
              placeholder="Latitud (ej: -34.6037)"
              value={searchParams.get('latitude') || ''}
              onChange={e => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('latitude', e.target.value);
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
              className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
            <input
              type="number"
              step="any"
              name="longitude"
              placeholder="Longitud (ej: -58.3816)"
              value={searchParams.get('longitude') || ''}
              onChange={e => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('longitude', e.target.value);
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
              className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
            <input
              type="number"
              step="1"
              min="1"
              name="radius"
              placeholder="Radio (km, ej: 10)"
              value={searchParams.get('radius') || ''}
              onChange={e => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('radius', e.target.value);
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
              className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
          <select
            name="city"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
          >
            <option value="">Todas las ciudades</option>
            {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            name="category"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
          >
            <option value="">Todas las categorías</option>
            {uniqueCategories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-slate-700 mb-1">Ordenar por</label>
          <select
            name="sort"
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
          >
            <option value="relevance">Relevancia</option>
            <option value="date_desc">Más recientes</option>
            <option value="date_asc">Más antiguos</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="name_asc">Nombre: A-Z</option>
            <option value="name_desc">Nombre: Z-A</option>
          </select>
        </div>
        {/* Nuevo control para filtrar por Vendedores PRO */}
        <div className="flex items-center lg:col-span-1"> {/* Ajustar span si es necesario */}
            <input
                type="checkbox"
                id="onlyProVendors"
                name="onlyProVendors"
                checked={onlyProVendors}
                onChange={(e) => setOnlyProVendors(e.target.checked)}
                className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="onlyProVendors" className="ml-2 block text-sm font-medium text-slate-700">Solo Vendedores PRO</label>
        </div>
        <button 
          type="submit" 
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center text-sm mt-auto"
        >
          <FilterIcon />
          Aplicar Filtros
        </button>
      </div>
    </form>
  );
}
