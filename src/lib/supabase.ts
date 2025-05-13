import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type SupabaseClient as TSCSupabaseClient } from '@supabase/supabase-js'; // Renombrar para evitar conflicto

// Definición básica del tipo Database (SOLUCIÓN TEMPORAL)
// La forma recomendada es generar este tipo con la CLI de Supabase
export interface Database {
  public: {
    Tables: {
      products: {
        Row: any; // Usar 'any' temporalmente
        Insert: any;
        Update: any;
      };
      vendors: {
        Row: any; // Usar 'any' temporalmente
        Insert: any;
        Update: any;
      };
      users: { // Añadir la tabla users
        Row: any; // Usar 'any' temporalmente
        Insert: any;
        Update: any;
      };
      // Añadir otras tablas según sea necesario con 'any' temporalmente
    };
    Enums: {
      [_ in string]: string;
    };
    Functions: {
      [_ in string]: {
        Args: any;
        Returns: any;
      };
    };
  };
}

// Definir el tipo explícito para el cliente Supabase del servidor
export type SupabaseClient = TSCSupabaseClient<Database>;

export function createServerSupabaseClient(): SupabaseClient {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Usar 'as any' para eludir el error de tipado si TypeScript infiere incorrectamente Promise
          return (cookieStore as any).get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Ensure 'set' function exists on cookieStore before calling
            if (typeof (cookieStore as any).set === 'function') {
              (cookieStore as any).set({ name, value, ...options });
            }
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Ensure 'set' function exists on cookieStore before calling to remove
            if (typeof (cookieStore as any).set === 'function') {
              (cookieStore as any).set({ name, value: '', ...options }); // Standard way to remove via set
            }
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
