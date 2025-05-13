'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// TODO: El usuario debe configurar estas variables de entorno
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY; // No se usa en backend para crear preferencia, pero es bueno tenerla.

// TODO: El usuario debe configurar esta URL base en sus variables de entorno o aquí directamente
// Idealmente, esta debería ser la URL pública de la aplicación desplegada.
// Para desarrollo, se puede usar una herramienta como ngrok si se quieren probar webhooks localmente.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const PRO_SUBSCRIPTION_PRICE = 1000; // Precio de la suscripción PRO en ARS (ejemplo)
const PRO_SUBSCRIPTION_TITLE = 'Suscripción Vendedor PRO PubliMarket';

interface CreateProSubscriptionPreferenceResponse {
  preferenceId?: string;
  checkoutUrl?: string;
  error?: string;
}

export async function createProSubscriptionPreference(
  userId: string,
  userEmail: string
): Promise<CreateProSubscriptionPreferenceResponse> {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.error('Error: MERCADOPAGO_ACCESS_TOKEN no está configurado.');
    return { error: 'Error de configuración del servidor de pagos.' };
  }

  if (!userId || !userEmail) {
    return { error: 'Información de usuario inválida.' };
  }

  const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
  const preference = new Preference(client);

  try {
    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: `pro-sub-${userId}`, // ID único del ítem
            title: PRO_SUBSCRIPTION_TITLE,
            quantity: 1,
            unit_price: PRO_SUBSCRIPTION_PRICE,
            currency_id: 'ARS', // Moneda (Pesos Argentinos)
            description: 'Acceso a funciones PRO para vendedores en PubliMarket.',
            category_id: 'services', // ID de categoría de Mercado Pago (opcional)
          },
        ],
        payer: {
          email: userEmail,
          // Se podrían añadir más datos del pagador si se tienen
        },
        back_urls: {
          success: `${APP_URL}/dashboard/vendedor/suscripcion/resultado?status=success`,
          pending: `${APP_URL}/dashboard/vendedor/suscripcion/resultado?status=pending`,
          failure: `${APP_URL}/dashboard/vendedor/suscripcion/resultado?status=failure`,
        },
        auto_return: 'approved', // Redirigir automáticamente solo si el pago es aprobado
        notification_url: `${APP_URL}/api/mercadopago/webhook`, // URL para webhooks
        external_reference: userId, // Referencia externa para identificar al usuario
        metadata: { // Metadatos adicionales
          user_id: userId,
          subscription_type: 'PRO_VENDOR_MONTHLY', // Ejemplo de tipo de suscripción
        },
        // Se podrían añadir más opciones como fecha de expiración de la preferencia, etc.
      },
    });

    if (preferenceData.id && preferenceData.init_point) {
      return {
        preferenceId: preferenceData.id,
        checkoutUrl: preferenceData.init_point, // URL de checkout de Mercado Pago
      };
    } else {
      console.error('Respuesta inesperada de Mercado Pago al crear preferencia:', preferenceData);
      return { error: 'No se pudo iniciar el proceso de pago. Intente más tarde.' };
    }
  } catch (error: any) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    // Podríamos querer loguear error.response?.data para más detalles del error de MP
    return { error: error.message || 'Error al conectar con el servicio de pagos.' };
  }
}

// Placeholder para una futura acción que maneje la actualización del estado PRO
// Esta se llamaría desde el webhook
export async function updateUserToPro(userId: string) {
  const supabase = createServerActionClient<Database>({ cookies });
  
  // Primero, verificar si el usuario existe en la tabla 'vendors'
  // Esto asume que el userId es el auth.users.id y que hay una tabla 'vendors'
  // con una columna 'user_id' que lo referencia.
  // Si la columna 'is_pro' está en 'auth.users', entonces se actualiza 'auth.users'.
  // Por ahora, asumimos que está en 'vendors'.

  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (vendorError || !vendor) {
    console.error(`Error: No se encontró el vendedor para el user_id ${userId} o hubo un error.`, vendorError);
    // Podríamos crear un perfil de vendedor aquí si no existe, o manejarlo de otra forma.
    // Por ahora, solo logueamos y no actualizamos.
    return { error: `Vendedor no encontrado para el usuario ${userId}.` };
  }
  
  // Actualizar la columna is_pro a true para el vendedor encontrado
  const { error: updateError } = await supabase
    .from('vendors')
    .update({ is_pro: true })
    .eq('id', vendor.id); // Usar el ID de la tabla vendors

  if (updateError) {
    console.error(`Error al actualizar el estado PRO para el vendedor ${vendor.id} (usuario ${userId}):`, updateError);
    return { error: 'Error al actualizar la suscripción.' };
  }

  console.log(`Vendedor ${vendor.id} (usuario ${userId}) actualizado a PRO.`);

  // TODO: Enviar correo electrónico de confirmación de suscripción PRO.
  // Esto debería hacerse a través de una Edge Function o un backend seguro
  // para interactuar con un servicio de envío de correos (ej. Resend, SendGrid).
  // Se necesitaría obtener el email del usuario (posiblemente de auth.users)
  // y usar una plantilla de correo adecuada.
  // Ejemplo (pseudocódigo):
  // await sendSubscriptionConfirmationEmail(userEmail, PRO_SUBSCRIPTION_TITLE);

  return { success: true };
}
