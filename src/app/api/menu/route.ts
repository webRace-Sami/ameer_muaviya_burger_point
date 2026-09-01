import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await db.getMenuItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error('API Menu GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nameEn || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }
    const newItem = await db.addMenuItem({
      nameEn: body.nameEn,
      nameUr: body.nameUr || body.nameEn,
      description: body.description || '',
      price: Number(body.price),
      category: body.category || 'Burgers',
      image: body.image || '/images/single-egg-burger.jpg',
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      isFeatured: body.isFeatured || false,
      sortOrder: body.sortOrder || 0,
    });
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('API Menu POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
