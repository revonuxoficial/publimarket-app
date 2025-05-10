import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type SupabaseClient } from '@supabase/supabase-js'; // Importar SupabaseClient desde aquí

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
