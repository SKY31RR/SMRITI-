import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || session.patientProfileId;

    if (!patientId) return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });

    const memories = await db.memory.findMany({
      where: { patientId },
      include: {
        memoryPerson: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ memories });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { patientId, memoryPersonId, title, description, memoryDate, imageUrl } = body;

    if (!patientId || !title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const memory = await db.memory.create({
      data: {
        patientId,
        memoryPersonId: memoryPersonId || null,
        title,
        description,
        memoryDate: memoryDate || null,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
      include: {
        memoryPerson: true,
      },
    });

    return NextResponse.json({ memory }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });

    await db.memory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
