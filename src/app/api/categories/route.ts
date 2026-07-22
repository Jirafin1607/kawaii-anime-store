import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST create category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await db.category.create({
      data: { name: body.name, slug: body.slug, icon: body.icon || '📦', order: body.order || 0 },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT update category
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await db.category.update({
      where: { id: body.id },
      data: { name: body.name, slug: body.slug, icon: body.icon, order: body.order },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}