import { createClient } from '@/lib/supabase'; // Cliente de Supabase del lado del servidor
import { redirect } from 'next/navigation'; // Para redirigir
import React from 'react';
import NewProductForm from '@/components/NewProductForm'; // Importar el Client Component del formulario

// Función auxiliar para verificar si el usuario es un vendedor PRO (duplicada para Server Component)
// En una aplicación real, esta lógica podría centralizarse o manejarse de otra forma
async function checkProVendorServer(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario, redirigir a la página de autenticación
    redirect('/auth');
  }

  // Obtener el rol del usuario desde la tabla 'users'
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userProfile || userProfile.role !== 'pro_vendor') {
    // Si hay error, no se encuentra el perfil, o no es PRO, redirigir
    redirect('/'); // Redirigir al inicio
  }

  return user; // Retornar el usuario si es PRO
}


export default async function NuevoProductoPage() {
  const supabase = createClient(); // Crear instancia del cliente del lado del servidor

  // Verificar si el usuario es un vendedor PRO
  const user = await checkProVendorServer(supabase);

  // Si el usuario es PRO, renderizar el formulario
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Producto</h1>
      {/* Renderizar el Client Component del formulario */}
      <NewProductForm />
    </div>
  );
}
