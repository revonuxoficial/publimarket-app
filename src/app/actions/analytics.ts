'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { checkProVendor } from '@/app/actions/utils'; // Importar la función de utilidad centralizada

// Definición básica del tipo para las estadísticas (si la tabla analytics existe)
// La forma recomendada es generar este tipo con la CLI de Supabase
export interface VendorAnalytics {
  totalViews: number;
  whatsappClicks: number;
}


/**
 * Obtiene las estadísticas básicas (visitas a tienda, clics en WhatsApp) del vendedor autenticado.
 * Asume la existencia de una tabla 'analytics' con 'vendor_id' y 'event_type'.
 * @returns Una promesa que resuelve con un objeto VendorAnalytics o null si no es vendedor PRO o hay un error.
 */
export async function getVendorAnalytics(): Promise<VendorAnalytics | null> {
  // Verificar si el usuario es un vendedor PRO y obtener su ID de vendedor
  const authCheck = await checkProVendor();
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  try {
    // Contar visitas a la tienda
    const { count: totalViews, error: viewsError } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true }) // Contar filas sin traer datos
      .eq('vendor_id', vendorId)
      .eq('event_type', 'view');

    if (viewsError) {
      console.error('Error fetching vendor views:', viewsError);
      return null;
    }

    // Contar clics en WhatsApp
    const { count: whatsappClicks, error: clicksError } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true }) // Contar filas sin traer datos
      .eq('vendor_id', vendorId)
      .eq('event_type', 'whatsapp_click');

    if (clicksError) {
      console.error('Error fetching whatsapp clicks:', clicksError);
      return null;
    }

    return {
      totalViews: totalViews || 0, // Usar 0 si el conteo es null
      whatsappClicks: whatsappClicks || 0, // Usar 0 si el conteo es null
    };

  } catch (error) {
    console.error('Unexpected error fetching vendor analytics:', error);
    return null;
  }
}
