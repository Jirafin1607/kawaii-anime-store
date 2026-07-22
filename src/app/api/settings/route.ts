import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET settings
export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst();
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'default' } });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT update settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await db.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        bgColor: body.bgColor,
        textColor: body.textColor,
        whatsappNumber: body.whatsappNumber,
        email: body.email,
        facebookUrl: body.facebookUrl,
        mercadoLibreUrl: body.mercadoLibreUrl,
        heroImage: body.heroImage,
        adminPassword: body.adminPassword,
      },
      create: { id: 'default', ...body },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// POST verify admin password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await db.siteSettings.findFirst();
    if (!settings) return NextResponse.json({ valid: false }, { status: 401 });
    
    if (body.password === settings.adminPassword) {
      return NextResponse.json({ valid: true, settings });
    }
    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify password' }, { status: 500 });
  }
}