import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await db.getShopSetting();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('API Shop GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await db.updateShopSetting(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('API Shop PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
