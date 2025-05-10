import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

// Reutilizar la definición básica del tipo Database (SOLUCIÓN TEMPORAL)
// La forma recomendada es generar este tipo con la CLI de Supabase
interface Database {
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


// Función para crear un cliente de Supabase para usar en el lado del cliente (Browser)
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
