'use server';

import { createServerSupabaseClient, Database } from '@/lib/supabase'; // Importar createServerSupabaseClient y Database
// cookies ya no es necesario importarlo directamente aquí si createServerSupabaseClient lo maneja internamente.
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Esquema para la solicitud de restablecimiento de contraseña
const RequestResetSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un email válido." }),
});

export interface AuthFormState {
  message: string;
  type?: 'success' | 'error';
  issues?: string[];
}

/**
 * Maneja el inicio de sesión y registro de usuarios.
 * (Esta función ya existe en actions/public.ts, la muevo aquí para centralizar acciones de auth)
 * Si se decide moverla, hay que actualizar las importaciones en AuthForm.tsx
 */
export async function handleAuth(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const action = formData.get('action') as 'login' | 'register';

  const supabase = createServerSupabaseClient();

  if (action === 'register') {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`, 
      },
    });

    if (signUpError) {
      return { message: signUpError.message, type: 'error' };
    }

    // La inserción en public.users ahora es manejada por el trigger de la base de datos.
    // Ya no es necesario el bloque if (signUpData.user) {...} para insertar aquí.
    // Solo necesitamos asegurarnos de que signUpData.user exista para el mensaje de éxito.
    if (!signUpData.user) {
      // Esto sería inesperado si signUpError es null.
      return { message: 'No se pudo obtener la información del usuario después del registro.', type: 'error' };
    }

    return { message: 'Registro exitoso. Por favor, revisá tu email para confirmar tu cuenta.', type: 'success' };
  }

  if (action === 'login') {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { message: error.message, type: 'error' };
    }
    // Redirigir explícitamente después de un inicio de sesión exitoso.
    // El middleware debería recoger la sesión actualizada en la siguiente petición.
    redirect('/'); 
    // Si se necesita devolver un estado para useFormState, la redirección debe manejarse en el cliente.
    // Por ahora, priorizamos la redirección directa para asegurar el flujo.
    // return { message: 'Inicio de sesión exitoso.', type: 'success' }; 
  }
  return { message: 'Acción no válida.', type: 'error' };
}


/**
 * Solicita un email de restablecimiento de contraseña.
 */
export async function requestPasswordReset(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get('email') as string;
  
  const validatedFields = RequestResetSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      message: "Error de validación.",
      issues: validatedFields.error.flatten().fieldErrors.email,
      type: 'error',
    };
  }

  const supabase = createServerSupabaseClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/actualizar-contrasena`;

  const { error } = await supabase.auth.resetPasswordForEmail(validatedFields.data.email, {
    redirectTo,
  });

  if (error) {
    console.error('Error requesting password reset:', error);
    return { message: `Error al solicitar restablecimiento: ${error.message}`, type: 'error' };
  }

  return { 
    message: 'Si tu email está registrado, recibirás un correo con instrucciones para restablecer tu contraseña.', 
    type: 'success' 
  };
}

/**
 * Actualiza la contraseña del usuario.
 * Esta acción se usa en la página a la que se redirige desde el email de restablecimiento.
 * Supabase Auth UI o el Auth Helper de Next.js manejan el token de la URL.
 */
export async function updateUserPassword(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { message: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' };
  }
  if (password !== confirmPassword) {
    return { message: 'Las contraseñas no coinciden.', type: 'error' };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Error updating password:', error);
    return { message: `Error al actualizar la contraseña: ${error.message}`, type: 'error' };
  }

  // No redirigir aquí directamente, la página puede manejarlo.
  // redirect('/auth?message=Contraseña actualizada con éxito. Ya podés iniciar sesión.');
  return { message: 'Contraseña actualizada con éxito. Ya podés iniciar sesión.', type: 'success' };
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/auth'); // Redirigir a la página de login
}
