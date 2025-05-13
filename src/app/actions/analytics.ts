'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import { checkProVendor } from '@/app/actions/utils'; // Importar la función de utilidad centralizada

export interface VendorAnalyticsData {
  totalProducts: number;
  activeProducts: number;
  totalProductViews: number;
  // whatsappClicks: number; // Mantener si la tabla 'analytics' se usa para esto
}

export interface GetVendorAnalyticsResult {
  data?: VendorAnalyticsData;
  error?: string;
}

/**
 * Obtiene estadísticas del vendedor: total de productos, productos activos, y vistas totales de productos.
 * @returns Una promesa que resuelve con las estadísticas o un error.
 */
export async function getVendorAnalytics(): Promise<GetVendorAnalyticsResult> {
  const authCheck = await checkProVendor(); // Asegura que es un pro_vendor y obtiene vendorId
  const vendorId = authCheck.vendorId;

  const supabase = createServerActionClient<Database>({ cookies });

  try {
    // 1. Contar total de productos
    const { count: totalProducts, error: totalProductsError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId);

    if (totalProductsError) {
      console.error('Error fetching total products count:', totalProductsError);
      return { error: totalProductsError.message };
    }

    // 2. Contar productos activos
    const { count: activeProducts, error: activeProductsError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendorId)
      .eq('is_active', true);

    if (activeProductsError) {
      console.error('Error fetching active products count:', activeProductsError);
      return { error: activeProductsError.message };
    }

    // 3. Sumar vistas de productos (asumiendo columna 'view_count' en 'products')
    // Esta es una forma de hacerlo, pero SUM() sobre una columna puede ser más eficiente si Supabase lo permite así.
    // La API de JS de Supabase no tiene un agregador SUM directo en el select, se haría con .rpc() o una vista.
    // Alternativa: obtener todos los view_counts y sumarlos en JS (menos eficiente para muchos productos).
    const { data: productViewsData, error: productViewsError } = await supabase
      .from('products')
      .select('view_count')
      .eq('vendor_id', vendorId);

    if (productViewsError) {
      console.error('Error fetching product views:', productViewsError);
      return { error: productViewsError.message };
    }

    const totalProductViews = productViewsData?.reduce((sum, product) => sum + (product.view_count || 0), 0) || 0;
    
    // 4. WhatsApp Clicks (si se mantiene la tabla 'analytics')
    // const { count: whatsappClicks, error: clicksError } = await supabase
    //   .from('analytics')
    //   .select('*', { count: 'exact', head: true })
    //   .eq('vendor_id', vendorId)
    //   .eq('event_type', 'whatsapp_click');
    // if (clicksError) {
    //   console.warn('Error fetching whatsapp clicks:', clicksError.message); // No hacer fatal
    // }

    return {
      data: {
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalProductViews: totalProductViews,
        // whatsappClicks: whatsappClicks || 0,
      },
    };

  } catch (error: any) {
    console.error('Unexpected error fetching vendor analytics:', error);
    return { error: error.message || 'Error inesperado.' };
  }
}
