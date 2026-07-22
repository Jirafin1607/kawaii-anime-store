import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET chat messages by session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json([]);
    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST send chat message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await db.siteSettings.findFirst();
    
    // Save user message
    const userMsg = await db.chatMessage.create({
      data: {
        sessionId: body.sessionId,
        role: 'user',
        content: body.content,
        customerName: body.customerName || '',
        customerEmail: body.customerEmail || '',
        customerPhone: body.customerPhone || '',
      },
    });

    // Generate bot response
    let botResponse = '';
    const msg = body.content.toLowerCase();

    if (msg.includes('precio') || msg.includes('cuanto cuesta') || msg.includes('costo')) {
      botResponse = '¡Hola! Los precios varían según el producto. Te recomiendo revisar nuestro catálogo donde cada producto muestra su precio. ¿Buscas algo en particular? Puedo ayudarte a encontrarlo.';
    } else if (msg.includes('horario') || msg.includes('abierto') || msg.includes('atend')) {
      botResponse = '¡Estamos disponibles por mensaje las 24 horas! Responderemos lo antes posible. Si necesitas algo urgente, contáctanos por WhatsApp.';
    } else if (msg.includes('envio') || msg.includes('envío') || msg.includes('entrega')) {
      botResponse = 'Realizamos envíos a todo el país. El costo y tiempo de entrega depende de tu ubicación. ¡Cuéntame tu código postal y te doy más detalles!';
    } else if (msg.includes('pago') || msg.includes('pagar') || msg.includes('tarjeta')) {
      botResponse = 'Aceptamos pagos con tarjeta de crédito/débito, también puedes comprar por Mercado Libre o Facebook Marketplace. ¿Qué producto te interesa?';
    } else if (msg.includes('hola') || msg.includes('buenos') || msg.includes('hi')) {
      botResponse = '¡Hola! 😊 Bienvenido/a a Kawaii Anime Store. ¿En qué puedo ayudarte? Puedo mostrarte nuestros productos, precios, o contestar cualquier duda. ¡Pregunta lo que quieras!';
    } else if (msg.includes('gracias') || msg.includes('thanks')) {
      botResponse = '¡De nada! 😊 Estamos aquí para ayudarte. Si tienes más preguntas, no dudes en escribir. ¡Que tengas un día genial!';
    } else if (msg.includes('ropa') || msg.includes('modific')) {
      botResponse = '¡Sí! Hacemos modificaciones de ropa de segunda mano: convertimos pantalones en shorts, agregamos mangas, cuellos, dibujos y más. Cada pieza es única. ¿Te interesa algo específico?';
    } else if (msg.includes('dibujo') || msg.includes('imprim')) {
      botResponse = '¡Por supuesto! Realizamos dibujos de personajes de anime y los imprimimos en papel fotográfico de alta calidad. Tienes dos opciones: que dibujemos tu personaje favorito o elegir de nuestro catálogo. ¿Qué prefieres?';
    } else if (msg.includes('pin') || msg.includes('llavero') || msg.includes('joyer')) {
      botResponse = 'Tenemos una gran variedad de pines y llaveros con diseños kawaii, chibi y de personajes de anime. Los precios empiezan desde $20 MXN. ¡Visita nuestro catálogo para ver todos los diseños disponibles!';
    } else {
      botResponse = 'Gracias por tu mensaje. Para darte una mejor atención, ¿podrías decirme qué producto te interesa? Si prefieres, puedes dejar tu nombre, teléfono y correo y te contactamos directamente.';
    }

    // Check if customer info was provided - mark for forwarding
    const needsForward = body.customerName && (body.customerPhone || body.customerEmail);
    
    const botMsg = await db.chatMessage.create({
      data: {
        sessionId: body.sessionId,
        role: 'bot',
        content: botResponse,
        customerName: body.customerName || '',
        customerEmail: body.customerEmail || '',
        customerPhone: body.customerPhone || '',
        isForwarded: needsForward,
      },
    });

    // Build WhatsApp & email forwarding info
    let forwardInfo = null;
    if (needsForward && settings) {
      const waMsg = encodeURIComponent(
        `🛍️ Nuevo cliente en el chatbot:\n` +
        `Nombre: ${body.customerName}\n` +
        `Teléfono: ${body.customerPhone || 'No proporcionado'}\n` +
        `Email: ${body.customerEmail || 'No proporcionado'}\n` +
        `Mensaje: ${body.content}\n` +
        `📅 ${new Date().toLocaleString('es-MX')}`
      );
      forwardInfo = {
        whatsappLink: settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}?text=${waMsg}` : '',
        email: settings.email || '',
        customerInfo: { name: body.customerName, phone: body.customerPhone, email: body.customerEmail, message: body.content },
      };
    }

    return NextResponse.json({ botMessage: botMsg, forwardInfo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}