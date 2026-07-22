import { db } from './src/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Default settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Kawaii Anime Store',
      storeDescription: 'Artesanías únicas de anime: pines, llaveros, dibujos, ropa modificada y joyería económica. ¡Hecho con amor!',
      primaryColor: '#e91e8c',
      accentColor: '#a855f7',
      bgColor: '#0f0a1a',
      textColor: '#f8fafc',
      whatsappNumber: '5215512345678',
      email: 'tienda@kawaianime.com',
      facebookUrl: 'https://facebook.com/kawaianimestore',
      mercadoLibreUrl: 'https://mercadolibre.com',
      heroImage: '/products/pines-1.jpg',
      adminPassword: 'admin123',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'pines' }, update: { order: 1 }, create: { name: 'Pines', slug: 'pines', icon: '📌', order: 1 } }),
    prisma.category.upsert({ where: { slug: 'llaveros' }, update: { order: 2 }, create: { name: 'Llaveros', slug: 'llaveros', icon: '🔑', order: 2 } }),
    prisma.category.upsert({ where: { slug: 'dibujos' }, update: { order: 3 }, create: { name: 'Dibujos Impresos', slug: 'dibujos', icon: '🎨', order: 3 } }),
    prisma.category.upsert({ where: { slug: 'ropa' }, update: { order: 4 }, create: { name: 'Ropa Modificada', slug: 'ropa', icon: '👕', order: 4 } }),
    prisma.category.upsert({ where: { slug: 'joyeria' }, update: { order: 5 }, create: { name: 'Joyería Económica', slug: 'joyeria', icon: '💍', order: 5 } }),
  ]);

  // Sample products
  const productsData = [
    // Pines
    { name: 'Pin Kawaii Rosa', description: 'Pin redondo con diseño kawaii estilo anime. Personaje con ojos grandes y mejillas rosadas, ideal para decorar mochilas y ropa.', price: 25, stock: 15, categoryId: categories[0].id, images: '["/products/pines-1.jpg"]', featured: true },
    { name: 'Pin Chibi Azul', description: 'Pin con personaje chibi estilo anime en tonos azules. Broche de metal resistente, perfecto para coleccionistas.', price: 25, stock: 12, categoryId: categories[0].id, images: '["/products/pines-1.jpg"]', featured: true },
    { name: 'Pin Estilo Horror', description: 'Pin con diseño oscuro de calavera en blanco y negro. Para fans del anime dark y gótico.', price: 30, stock: 8, categoryId: categories[0].id, images: '["/products/pines-1.jpg"]', featured: false },
    { name: 'Pack 3 Pines Kawaii', description: 'Paquete de 3 pines con diseños variados estilo kawaii: amarillo, rosa y azul. ¡Gran oferta!', price: 60, stock: 10, categoryId: categories[0].id, images: '["/products/pines-1.jpg"]', featured: true },
    { name: 'Pin Monstruo Verde', description: 'Pin con adorable monstruo verde estilo anime. Diseño original hecho a mano.', price: 20, stock: 20, categoryId: categories[0].id, images: '["/products/pines-1.jpg"]', featured: false },

    // Llaveros
    { name: 'Llavero Sailor Chibi', description: 'Llavero de acrílico con figura chibi de sailor. Colores brillantes y anilla de metal resistente.', price: 45, stock: 10, categoryId: categories[1].id, images: '["/products/llaveros-1.jpg"]', featured: true },
    { name: 'Llavero Corazón Anime', description: 'Llavero transparente en forma de corazón con diseño de ojos de anime en el interior.', price: 35, stock: 14, categoryId: categories[1].id, images: '["/products/llaveros-1.jpg"]', featured: false },
    { name: 'Llavero Cinta Multicolor', description: 'Llavero artesanal con cintas de colores enrolladas combinadas con plástico brillante.', price: 30, stock: 18, categoryId: categories[1].id, images: '["/products/llaveros-1.jpg"]', featured: true },
    { name: 'Llavero Chica Rosa', description: 'Llavero con figura de chica de pelo rosa y vestido blanco, estilo kawaii. Resina de alta calidad.', price: 50, stock: 7, categoryId: categories[1].id, images: '["/products/llaveros-1.jpg"]', featured: false },
    { name: 'Llavero Dupla Rubia', description: 'Llavero con dos personajes de pelo rubio, perfecto para parejas de anime. Acrílico doble cara.', price: 55, stock: 5, categoryId: categories[1].id, images: '["/products/llaveros-1.jpg"]', featured: true },

    // Dibujos
    { name: 'Impresión Chibi Verde', description: 'Impresión en papel fotográfico de alta calidad. Personaje chibi verde con fondo colorido y texto "PIZZA". Tamaño 4x6 pulgadas.', price: 40, stock: 8, categoryId: categories[2].id, images: '["/products/dibujos-1.jpg"]', featured: true },
    { name: 'Impresión Kawaii Corazones', description: 'Impresión de personaje con pelo verde y corazones sobre fondo amarillo. Estilo adorable y brillante. Papel fotográfico premium.', price: 45, stock: 6, categoryId: categories[2].id, images: '["/products/dibujos-1.jpg"]', featured: true },
    { name: 'Impresión Dark Goth', description: 'Impresión de personaje con pelo negro y rayas rosas sobre fondo oscuro. Estilo gótico-anime para fans del género.', price: 50, stock: 4, categoryId: categories[2].id, images: '["/products/dibujos-1.jpg"]', featured: false },
    { name: 'Impresión Retro Demon', description: 'Impresión estilo retro con personaje de gafas y ropa roja sobre fondo negro. Texto "DEMON XTER" incluido.', price: 55, stock: 3, categoryId: categories[2].id, images: '["/products/dibujos-1.jpg"]', featured: true },
    { name: 'Poster Grande Anime', description: 'Poster grande de personaje anime en estilo kawaii. Impresión en papel fotográfico de alta resolución. Tamaño 8.5x11 pulgadas.', price: 80, stock: 5, categoryId: categories[2].id, images: '["/products/dibujos-1.jpg"]', featured: true },

    // Ropa
    { name: 'Short Modificado Anime', description: 'Pantalón de segunda mano transformado en short con bordado de personaje anime. Modificación artesanal única, talla M.', price: 250, stock: 3, categoryId: categories[3].id, images: '["/products/dibujos-1.jpg"]', featured: true },
    { name: 'Blusa Manga Larga Custom', description: 'Blusa de manga corta modificada con mangas largas agregadas y cuello estilo anime. Estampado de personaje kawaii. Talla S.', price: 320, stock: 2, categoryId: categories[3].id, images: '["/products/dibujos-1.jpg"]', featured: true },
    { name: 'Camiseta Pines Anime', description: 'Camiseta de segunda mano con pines de anime cosidos y pegados. Diseño exclusivo con múltiples personajes. Talla L.', price: 280, stock: 4, categoryId: categories[3].id, images: '["/products/dibujos-1.jpg"]', featured: false },

    // Joyería
    { name: 'Collar Estrella Kawaii', description: 'Collar con dije de estrella estilo kawaii en tonos rosa y dorado. Cadena ajustable de acero inoxidable.', price: 65, stock: 10, categoryId: categories[4].id, images: '["/products/dibujos-1.jpg"]', featured: true },
    { name: 'Pulsera Chibi Rosa', description: 'Pulsera de cuentas con charms de personajes chibi en rosa y blanco. Elástico resistente, ajustable.', price: 45, stock: 12, categoryId: categories[4].id, images: '["/products/dibujos-1.jpg"]', featured: false },
    { name: 'Aretes Luna Anime', description: 'Aretes de luna creciente con detalles de anime en acabado plateado. Hypoalergénicos, perfectos para fans.', price: 55, stock: 8, categoryId: categories[4].id, images: '["/products/dibujos-1.jpg"]', featured: true },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + p.categoryId.slice(0, 4) },
      update: {},
      create: {
        id: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + p.categoryId.slice(0, 4),
        ...p,
      },
    });
  }

  // Gallery items
  const galleryItems = [
    { title: 'Expo Anime Ciudad 2025', type: 'image', url: '/products/pines-1.jpg', thumbnail: '/products/pines-1.jpg' },
    { title: 'Mi stand en la expo', type: 'image', url: '/products/llaveros-1.jpg', thumbnail: '/products/llaveros-1.jpg' },
    { title: 'Productos en exhibición', type: 'image', url: '/products/dibujos-1.jpg', thumbnail: '/products/dibujos-1.jpg' },
  ];

  for (let i = 0; i < galleryItems.length; i++) {
    await prisma.galleryItem.upsert({
      where: { id: `gallery-${i + 1}` },
      update: {},
      create: { id: `gallery-${i + 1}`, ...galleryItems[i], order: i + 1 },
    });
  }

  console.log('✅ Seed data loaded successfully!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());