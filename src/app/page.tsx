'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getUniqueCategories } from '@/app/actions/public';

// Íconos
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400 group-focus-within:text-sky-500 transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// Componente de Tarjeta de Categoría Estilizada (solo color y texto)
const StyledCategoryCard = ({ category, bgColorClass, index }: { category: { id: string; name: string; slug: string; bgColorClass: string }, bgColorClass: string, index: number }) => (
  <Link
    href={`/productos?category=${category.slug}`}
    className={`block w-full h-full p-3 sm:p-4 flex flex-col items-center justify-center text-center rounded-2xl overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:scale-105 focus:shadow-2xl ${bgColorClass} animate-fade-in-visible`}
    style={{ animationDelay: `${index * 60}ms` }}
    tabIndex={0}
  >
    <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold tracking-tight drop-shadow-md">
      {category.name}
    </h3>
  </Link>
);

// Componente de Tarjeta de Producto Placeholder (mejorado)
const PlaceholderProductCard = ({ title, index }: { title: string, index: number }) => (
  <div
    className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 opacity-0 animate-fadeInUp flex flex-col min-w-[250px] sm:min-w-[270px] snap-start"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="relative w-full aspect-square bg-slate-200 flex items-center justify-center overflow-hidden">
      <svg className="w-1/2 h-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></path></svg>
    </div>
    <div className="p-4 sm:p-5 flex flex-col flex-grow">
      <h3 className="text-md sm:text-lg font-semibold text-slate-800 mb-1.5 truncate group-hover:text-sky-600 transition-colors">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-3">Vendedor Ejemplo</p>
      <p className="text-lg sm:text-xl font-bold text-sky-600 mb-4 mt-auto">$XX.XX</p>
      <Link href="#" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 sm:py-2.5 px-4 rounded-lg inline-flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-md text-sm sm:text-base">
        Ver Producto
      </Link>
    </div>
  </div>
);

// Hook para animaciones de scroll
const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Animando elemento:', entry.target);
          entry.target.classList.add('is-visible');
          entry.target.classList.remove('opacity-0');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    const elements = document.querySelectorAll('.scroll-animate, .animate-fadeInUp, .animate-fadeInDown');
    console.log('Elementos observados para animación:', elements.length, elements);
    elements.forEach(el => observer.observe(el));
    return () => elements.forEach(el => observer.unobserve(el));
  }, []);
};

// Componente Carrusel Básico
const Carousel = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Cambiado el umbral a 0 para deshabilitar solo cuando está exactamente al inicio
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (currentRef) {
      // Llama a checkScrollability inmediatamente y después de un breve retraso
      // para asegurar que el estado inicial se capture correctamente.
      checkScrollability();
      const timer = setTimeout(checkScrollability, 50);

      currentRef.addEventListener('scroll', checkScrollability, { passive: true });
      window.addEventListener('resize', checkScrollability);

      const mutationObserver = new MutationObserver(checkScrollability);
      mutationObserver.observe(currentRef, { childList: true, subtree: true });

      return () => {
        clearTimeout(timer); // Limpia el temporizador al desmontar
        currentRef.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
        mutationObserver.disconnect();
      };
    }
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 200;
      const scrollAmount = direction === 'left' ? -(cardWidth * 0.8) : (cardWidth * 0.8);
      // const scrollAmount = direction === 'left' ? -300 : 300; // Valor fijo para depuración
      scrollRef.current.scrollLeft += scrollAmount; // Mantener asignación directa de scrollLeft
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 sm:mb-8 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
          {title}
        </h2>
      </div>
      <div className="relative group/carousel"> {/* Quitado borde azul de depuración */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-4 scroll-smooth snap-x snap-mandatory pl-4 sm:pl-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {children}
        </div>
        <button // Corrected: Removed the duplicated <button tag
          onClick={() => scroll('left')}
          aria-label="Scroll Left"
          disabled={!canScrollLeft}
          className={`absolute top-1/2 -translate-y-1/2 left-0.5 sm:left-1 z-20 p-1 sm:p-1.5 text-slate-600 hover:text-sky-600 bg-white/50 hover:bg-white/75 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none transform hover:scale-110 active:scale-95 ${
            !canScrollLeft
              ? 'opacity-25 cursor-not-allowed' // Apply low opacity and cursor when disabled
              : 'opacity-100 group-hover/carousel:opacity-100 cursor-pointer' // Apply hover effect and ensure full opacity when enabled
          }`}
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={() => scroll('right')}
            aria-label="Scroll Right"
            disabled={!canScrollRight}
            className={`absolute top-1/2 -translate-y-1/2 right-0.5 sm:right-1 z-20 p-1 sm:p-1.5 text-slate-600 hover:text-sky-600 bg-white/50 hover:bg-white/75 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none transform hover:scale-110 active:scale-95 ${
              !canScrollRight
                ? 'opacity-25 cursor-not-allowed' // Apply low opacity and cursor when disabled
                : 'opacity-100 group-hover/carousel:opacity-100 cursor-pointer' // Apply hover effect and ensure full opacity when enabled
            }`}
          >
            <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

// Función simple para asignar clases de color de fondo basadas en el índice
const getBgColorClass = (index: number): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  ];
  return colors[index % colors.length];
};


export default function HomePage() {
  useScrollAnimation();

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; bgColorClass: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const uniqueCategories = await getUniqueCategories();
      console.log('Cantidad de categorías obtenidas:', uniqueCategories.length);
      uniqueCategories.forEach((cat, i) => console.log(`Categoría[${i}]:`, JSON.stringify(cat)));
      const categoriesWithColors = uniqueCategories.map((cat, index) => ({
        ...cat,
        bgColorClass: getBgColorClass(index)
      }));
      setCategories(categoriesWithColors);
    };

    fetchCategories();
  }, []);

  const featuredProducts = [
    "Producto Estrella 1", "Novedad Imperdible 2", "Oferta Limitada 3",
    "Más Vendido 4", "Exclusivo Online 5", "Recomendado 6",
    "Últimas Unidades 7", "Popular en tu Zona 8", "Imperdible 9", "Destacado del Mes 10",
    "Producto Top 11", "Oferta Flash 12", "Colección Nueva 13", "Especial de la Casa 14",
    "Liquidación Total 15", "Solo por Hoy 16"
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Ajustar min-h para ocupar el espacio restante después del header (h-16 md:h-20) */}
      {/* Eliminar padding vertical de la sección del hero */}
      <section className="w-full relative bg-gradient-to-br from-sky-600 via-indigo-700 to-purple-600 text-white min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        {/* Eliminar container y aplicar padding directamente al contenido */}
        {/* Eliminar padding horizontal para que el contenido ocupe todo el ancho */}
        <div className="w-full text-center relative z-10">
          {/* Eliminar padding horizontal del título */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 leading-tight opacity-0 animate-fadeInDown" style={{ animationDelay: '0.1s' }}>
            Tu Ciudad, <span className="text-amber-300 drop-shadow-md">Tu Mercado.</span>
          </h1>
          {/* Eliminar padding horizontal del subtítulo */}
          <p className="text-lg sm:text-xl lg:text-2xl text-sky-100 max-w-3xl mx-auto mb-10 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            Conectamos negocios locales con vos. Encontrá productos y servicios únicos, y contactá directo por WhatsApp.
          </p>
          {/* Eliminar max-w-xl del contenedor del formulario y padding horizontal */}
          <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            {/* Eliminar max-w-xl y mx-auto del formulario para que ocupe el ancho disponible con padding */}
            <form className="relative group flex flex-col sm:flex-row gap-3 items-center max-w-xl mx-auto"> {/* Mantener max-w-xl y mx-auto en el formulario para centrarlo */}
              <div className="relative w-full sm:flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos, servicios, tiendas..."
                  className="w-full pl-12 sm:pl-14 pr-5 py-3.5 sm:py-4 rounded-xl text-slate-800 text-base sm:text-lg placeholder-slate-400 focus:ring-4 focus:ring-sky-400/70 focus:outline-none shadow-lg transition-all duration-300 ease-in-out focus:shadow-sky-300/40"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Buscar</span>
              </button>
            </form>
            <p className="text-xs sm:text-sm text-sky-100 mt-3 opacity-70">Ej: Indumentaria en Palermo, Servicios de plomería, etc.</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-white"> {/* Eliminada clase scroll-animate */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Carousel title="Explorá por Categorías">
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className="relative min-w-[140px] sm:min-w-[160px] md:min-w-[170px] lg:min-w-[180px] xl:min-w-[190px] aspect-[4/3] sm:aspect-square lg:aspect-[5/4] snap-start rounded-2xl overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out" // Eliminada clase scroll-animate
                // No hover:scale-105 aquí, se maneja en StyledCategoryCard (Link)
              >
                <StyledCategoryCard category={cat} bgColorClass={cat.bgColorClass} index={i} />
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-slate-50 scroll-animate opacity-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <Carousel title="Lo Más Nuevo y Destacado">
            {featuredProducts.map((title, i) => (
              <div key={i} className="snap-start pr-1">
                <PlaceholderProductCard title={title} index={i} />
              </div>
            ))}
          </Carousel>
          <div className="text-center mt-12 sm:mt-16">
            <Link href="/productos" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out text-lg shadow-md hover:shadow-lg transform hover:scale-105">
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-slate-800 text-slate-200 scroll-animate opacity-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10 sm:mb-14">
            Simple, Rápido y Directo
          </h2>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10 text-center">
            {[
              { icon: "🔍", title: "Encontrá lo que Buscás", desc: "Explorá miles de productos y servicios de negocios locales en tu ciudad." },
              { icon: "📱", title: "Contactá por WhatsApp", desc: "Consultá dudas y realizá tus compras directamente con el vendedor, sin comisiones." },
              { icon: "🛍️", title: "Apoyá el Comercio Local", desc: "Descubrí la calidad y variedad que ofrecen los emprendedores de tu comunidad." }
            ].map((step, i) => (
              <div
                key={step.title}
                className="p-6 bg-slate-700/50 rounded-xl shadow-lg transition-all duration-300 hover:bg-slate-600/70 hover:shadow-2xl transform hover:-translate-y-1 opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${i * 150 + 300}ms` }}
              >
                <span className="text-5xl sm:text-6xl mb-4 block">{step.icon}</span>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2.5">{step.title}</h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// NOTA:
// 1. Las animaciones como animate-fadeInUp, animate-fadeInDown se asumen definidas en Tailwind config o globals.css.
// 2. La clase .is-visible se usa con IntersectionObserver para quitar opacity-0.
// 3. El componente Carousel es una implementación básica.
// 4. `scrollbar-hide` es un plugin de Tailwind.
