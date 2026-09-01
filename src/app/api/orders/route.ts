import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await db.getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('API Orders GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, totalAmount, specialNotes } = body;

    if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer Name, Phone, Address, and at least 1 item are required' },
        { status: 400 }
      );
    }

    const newOrder = await db.createOrder({
      customerName,
      customerPhone,
      customerAddress,
      specialNotes,
      items,
      totalAmount: Number(totalAmount),
    });

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('API Orders POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
