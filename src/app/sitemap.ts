import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase'; // Tipos de la base de datos

// URL base del sitio web. Reemplazar con la URL de producción.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Asegúrate de que estas variables de entorno estén disponibles en el entorno de build/ejecución del sitemap.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL o Anon Key no están definidas. Sitemap estará incompleto.');
    return [];
  }

  // Crear un cliente Supabase genérico para leer datos públicos
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  // URLs estáticas
  const staticRoutes = [
    '/',
    '/productos',
    // '/favoritos', // Excluido según robots.txt (privado)
    '/auth',
    // '/perfil', // Excluido según robots.txt (privado)
  ];

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));

  // URLs dinámicas para vendedores (tiendas)
  const { data: vendors, error: vendorsError } = await supabase
    .from('vendors')
    .select('slug, updated_at');

  if (vendorsError) {
    console.error('Error fetching vendors for sitemap:', vendorsError);
  }

  const vendorUrls: MetadataRoute.Sitemap = vendors
    ? vendors.map((vendor) => ({
        url: `${BASE_URL}/tienda/${vendor.slug}`,
        lastModified: new Date(vendor.updated_at).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    : [];

  // URLs dinámicas para productos
  // La ruta de producto es /producto/[slug] según la estructura de carpetas
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('slug, updated_at'); // Asumiendo que la tabla products tiene 'slug' y 'updated_at'

  if (productsError) {
    console.error('Error fetching products for sitemap:', productsError);
  }
  
  const productUrls: MetadataRoute.Sitemap = products
    ? products.map((product) => ({
        url: `${BASE_URL}/producto/${product.slug}`,
        lastModified: new Date(product.updated_at).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    : [];

  return [...staticUrls, ...vendorUrls, ...productUrls];
}
