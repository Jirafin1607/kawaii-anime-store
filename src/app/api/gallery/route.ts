import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all gallery items
export async function GET() {
  try {
    const items = await db.galleryItem.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

// POST create gallery item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await db.galleryItem.create({
      data: { title: body.title, type: body.type || 'image', url: body.url, thumbnail: body.thumbnail || '', order: body.order || 0 },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}

// DELETE gallery item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await db.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}