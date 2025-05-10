'use server';

import { createClient } from '@/lib/supabase'; // Cliente de Supabase del lado del servidor
import { revalidatePath } from 'next/cache'; // Para revalidar la caché después de la actualización

// Definir un tipo básico para los datos de actualización del perfil (SOLUCIÓN TEMPORAL)
// La forma recomendada es usar los tipos generados por la CLI
interface UpdateProfileData {
  // Añadir campos que se permitirán actualizar, por ahora solo un ejemplo
  // Por ejemplo: username?: string;
}

export async function updateUserProfile(data: UpdateProfileData) {
  const supabase = createClient(); // Crear instancia del cliente del lado del servidor

  // Obtener el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario autenticado, retornar un error o lanzar una excepción
  if (!user) {
    // Dependiendo de cómo se quiera manejar en el frontend, se puede retornar un objeto de error
    return { success: false, error: 'Usuario no autenticado' };
    // O lanzar un error: throw new Error('Usuario no autenticado');
  }

  // Actualizar el perfil del usuario en la tabla 'users'
  // Asegurarse de que la RLS en Supabase permita esta operación solo para el propio usuario
  const { error } = await supabase
    .from('users')
    .update(data) // Usar los datos recibidos para la actualización
    .eq('id', user.id); // Asegurar que solo se actualiza el perfil del usuario autenticado

  if (error) {
    console.error('Error al actualizar el perfil:', error);
    return { success: false, error: error.message };
  }

  // Revalidar la caché de la página de perfil para mostrar los datos actualizados
  revalidatePath('/perfil');

  return { success: true };
}
