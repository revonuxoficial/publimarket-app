import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateUserToPro } from '@/app/actions/payment'; // Importar la acción

// TODO: El usuario debe configurar esta variable de entorno
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

// TODO: El usuario podría querer configurar un Webhook Secret para verificar la firma
// const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  console.log('Webhook de Mercado Pago recibido.');

  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.error('Error: MERCADOPAGO_ACCESS_TOKEN no está configurado para el webhook.');
    return NextResponse.json({ error: 'Configuración interna del servidor incorrecta.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    console.log('Cuerpo del webhook:', JSON.stringify(body, null, 2));

    // TODO: Implementar verificación de autenticidad del webhook.
    // Esto es CRUCIAL para la seguridad en producción.
    // Se puede hacer verificando la firma x-signature si se configuró un secret,
    // o consultando el evento/pago a Mercado Pago para confirmar su validez.
    // Por ahora, solo logueamos.
    // Ejemplo de verificación (requiere configuración de secret en MP y aquí):
    // const signature = request.headers.get('x-signature');
    // const requestId = request.headers.get('x-request-id');
    // if (MERCADOPAGO_WEBHOOK_SECRET && signature && requestId) {
    //   // Lógica para verificar la firma (ver documentación de MP)
    // } else if (MERCADOPAGO_WEBHOOK_SECRET) {
    //   console.warn('Advertencia: Webhook secret configurado pero no se recibió firma/request-id.');
    //   // Podrías rechazar el webhook aquí si la verificación es estricta
    // }


    const eventType = body.type;
    const eventAction = body.action; // Por ejemplo: payment.created, payment.updated
    const eventData = body.data;

    console.log(`Tipo de evento: ${eventType}, Acción: ${eventAction}`);

    // Procesar solo eventos de pago aprobados
    // El tipo de evento para pagos suele ser 'payment' y la acción 'payment.updated' o 'payment.created'
    // El estado del pago se consulta directamente a la API de MP usando el ID del pago.
    if (eventType === 'payment' && eventData && eventData.id) {
      const paymentId = eventData.id;
      console.log(`Procesando ID de pago: ${paymentId}`);

      const client = new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
      const payment = new Payment(client);

      const paymentInfo = await payment.get({ id: paymentId });
      console.log('Información del pago obtenida de MP:', JSON.stringify(paymentInfo, null, 2));

      if (paymentInfo && paymentInfo.status === 'approved') {
        const userId = paymentInfo.external_reference; // Asumimos que guardamos userId aquí
        const orderId = paymentInfo.order?.id; // ID de la orden en MP

        if (userId) {
          console.log(`Pago ${paymentId} aprobado para usuario ${userId}. Actualizando estado a PRO.`);
          
          // Llamar a la Server Action para actualizar el estado del usuario
          const updateResult = await updateUserToPro(userId);

          if (updateResult.error) {
            console.error(`Error al actualizar usuario ${userId} a PRO: ${updateResult.error}`);
            // Aquí se podría reintentar o marcar para revisión manual
          } else {
            console.log(`Usuario ${userId} actualizado a PRO exitosamente.`);
          }
        } else {
          console.warn(`Pago ${paymentId} aprobado pero no se encontró external_reference (userId).`);
        }
      } else {
        console.log(`Pago ${paymentId} no aprobado o estado desconocido: ${paymentInfo?.status}`);
      }
    } else {
      console.log('Evento no procesado o datos de pago no encontrados en el webhook.');
    }

    // Responder a Mercado Pago para confirmar la recepción
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error al procesar webhook de Mercado Pago:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
