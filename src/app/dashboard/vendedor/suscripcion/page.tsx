'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProSubscriptionPreference } from '@/app/actions/payment';
import { createClient } from '@/lib/supabaseClient'; // Usar el cliente unificado de @supabase/ssr
import { type Database } from '@/lib/supabase'; // Importar tipos de DB
import LoadingSpinner from '@/components/LoadingSpinner'; // Asumiendo que tienes este componente

// TODO: Considerar mover estos a una configuración central si se usan en más lugares
const PRO_SUBSCRIPTION_PRICE_DISPLAY = 1000; // Precio para mostrar al usuario
const PRO_SUBSCRIPTION_TITLE_DISPLAY = 'Suscripción Vendedor PRO';

export default function ProSubscriptionPage() {
  const router = useRouter();
  const supabase = createClient(); // Usar la función correcta
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false); // Para mostrar si ya es PRO

  useEffect(() => {
    const fetchUserAndVendorStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || null);

        // Verificar si el vendedor ya es PRO
        // Asumimos que la columna 'is_pro' está en la tabla 'vendors'
        // y que hay una relación donde vendors.user_id = auth.users.id
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('is_pro')
          .eq('user_id', user.id)
          .single();

        if (vendorError && vendorError.code !== 'PGRST116') { // PGRST116: 0 rows
          console.error('Error fetching vendor status:', vendorError);
          // No establecer error aquí, podría ser que el perfil de vendedor no exista aún
        }
        if (vendorData) {
          setIsPro(vendorData.is_pro || false);
        }
      } else {
        router.push('/auth'); // Redirigir si no está logueado
      }
    };
    fetchUserAndVendorStatus();
  }, [supabase, router]);

  const handleSubscribe = async () => {
    if (!userId || !userEmail) {
      setError('No se pudo obtener la información del usuario. Por favor, intente de nuevo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await createProSubscriptionPreference(userId, userEmail);
      if (response.error) {
        setError(response.error);
      } else if (response.checkoutUrl) {
        // Redirigir al checkout de Mercado Pago
        window.location.href = response.checkoutUrl;
      } else {
        setError('No se pudo iniciar el proceso de pago. Respuesta inesperada.');
      }
    } catch (e: any) {
      console.error('Error en el proceso de suscripción:', e);
      setError(e.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (userId === null) { // Esperando a que se cargue el usuario
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 max-w-2xl">
      <div className="bg-white shadow-xl rounded-lg p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">
          {PRO_SUBSCRIPTION_TITLE_DISPLAY}
        </h1>
        <p className="text-slate-600 text-center mb-8 text-lg">
          Potenciá tu tienda y llegá a más clientes con nuestras funciones PRO.
        </p>

        {isPro ? (
          <div className="text-center p-6 bg-green-50 border border-green-300 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-700 mb-2">¡Ya sos Vendedor PRO!</h2>
            <p className="text-green-600">
              Disfrutá de todos los beneficios exclusivos para vendedores PRO.
            </p>
            {/* Podríamos añadir un enlace para gestionar la suscripción si existiera */}
          </div>
        ) : (
          <>
            <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-700 mb-3">Beneficios PRO:</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Mayor visibilidad para tus productos.</li>
                <li>Publicaciones destacadas.</li>
                <li>Acceso a estadísticas avanzadas.</li>
                <li>Soporte prioritario.</li>
                {/* Añadir más beneficios según el brief */}
              </ul>
              <p className="text-3xl font-bold text-sky-600 text-center mt-6 mb-2">
                ${PRO_SUBSCRIPTION_PRICE_DISPLAY} <span className="text-lg font-normal text-slate-500">/ mes</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className={`w-full flex items-center justify-center text-lg font-semibold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out
                          ${isLoading 
                            ? 'bg-sky-400 cursor-not-allowed' 
                            : 'bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'}`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="border-white" />
                  <span className="ml-2">Procesando...</span>
                </>
              ) : (
                'Suscribirme a PRO con Mercado Pago'
              )}
            </button>
            <p className="text-xs text-slate-500 text-center mt-4">
              Serás redirigido a Mercado Pago para completar la transacción de forma segura.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
