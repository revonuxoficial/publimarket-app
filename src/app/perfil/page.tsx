import { createServerActionClient } from '@supabase/auth-helpers-nextjs'; // Importar cliente de Server Action
import { cookies } from 'next/headers'; // Importar cookies
import { redirect } from 'next/navigation'; // Para redirigir
import React from 'react';
import { Database } from '@/lib/supabase'; // Importar tipos de Supabase
import ErrorMessage from '@/components/ErrorMessage'; // Importar componente de error


// Definir un tipo básico para el usuario de Supabase (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface SupabaseUser {
  email: string | undefined;
  id: string; // Añadir id ya que se usa para filtrar
  // Añadir otras propiedades del usuario si son necesarias
}

// Definir un tipo básico para los datos del perfil (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface UserProfile {
  email: string;
  role: string; // Asumiendo que el rol está en la tabla users
  // Añadir otros campos del perfil si existen en la tabla users
}


export default async function PerfilPage() {
  // Inicializar el cliente de Supabase del lado del servidor
  const supabase = createServerActionClient<Database>({ cookies });

  // Obtener la sesión del usuario
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, redirigir a la página de autenticación
  if (!user) {
    redirect('/auth');
  }

  // Obtener datos adicionales del perfil del usuario desde la tabla 'users'
  // Asumiendo que la tabla 'users' tiene los campos 'email' y 'role'
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('email, role') // Seleccionar los campos necesarios
    .eq('id', user.id) // Filtrar por el ID del usuario autenticado
    .single(); // Esperar un solo resultado

  if (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    // Manejar el error, mostrar un mensaje al usuario usando ErrorMessage
    return (
       <div className="container mx-auto p-4">
          <ErrorMessage message="Error al cargar el perfil." />
       </div>
    );
  }

  // Si no se encuentra el perfil (aunque el usuario esté autenticado, lo cual sería inusual si la RLS está bien configurada)
  if (!userProfile) {
      // Esto podría indicar un problema con la RLS o la estructura de la base de datos
      return (
         <div className="container mx-auto p-4">
            <ErrorMessage message="Perfil no encontrado." />
         </div>
      );
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil del Usuario</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <p className="text-gray-600 text-sm">Email:</p>
          <p className="text-gray-800 font-medium">{userProfile.email}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Rol:</p>
          <p className="text-gray-800 font-medium">{userProfile.role}</p>
        </div>
        {/* Aquí se podría añadir un formulario para editar el perfil en el futuro */}
        {/* Por ahora, solo mostramos los datos */}
      </div>
    </div>
  );
}
