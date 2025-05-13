'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { z } from 'zod';

// Esquema de validación para el formulario de contacto
const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(100),
  email: z.string().email({ message: "Por favor, ingresa un email válido." }),
  subject: z.string().min(5, { message: "El asunto debe tener al menos 5 caracteres." }).max(150),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }).max(2000),
});

export interface ContactFormState {
  message: string;
  fields?: Record<string, string>;
  issues?: Record<string, string[] | undefined> | undefined; // Errores de campo de Zod
  type?: 'success' | 'error';
}

/**
 * Guarda un mensaje de contacto en la base de datos.
 */
export async function sendContactMessage(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const supabase = createServerActionClient<Database>({ cookies });

  const rawFormData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const validatedFields = ContactFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: "Error de validación. Por favor, revisa los campos.",
      issues: validatedFields.error.flatten().fieldErrors, // Asignar fieldErrors directamente
      type: 'error',
    };
  }
  
  const { name, email, subject, message } = validatedFields.data;

  const { error } = await supabase
    .from('contact_messages') // Asumiendo que esta tabla existe
    .insert({ name, email, subject, message });

  if (error) {
    console.error('Error saving contact message:', error);
    return { 
      message: `Error al enviar el mensaje: ${error.message}`,
      type: 'error',
    };
  }

  return { 
    message: '¡Gracias por tu mensaje! Nos pondremos en contacto pronto.',
    type: 'success',
  };
}
