import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all orders
export async function GET() {
  try {
    const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST create order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await db.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        items: JSON.stringify(body.items),
        total: parseFloat(body.total),
        status: 'pending',
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// PUT update order status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await db.order.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}