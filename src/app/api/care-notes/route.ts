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

    const careNotes = await db.careNote.findMany({
      where: { patientId },
      include: {
        caregiver: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ careNotes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden: Only caregivers can log observations' }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, mood, activity, tags, notes } = body;

    if (!patientId || !mood || !activity || !notes) {
      return NextResponse.json({ error: 'Missing required care note fields' }, { status: 400 });
    }

    const note = await db.careNote.create({
      data: {
        patientId,
        caregiverId: session.id,
        mood,
        activity,
        tags: tags || `${mood}, ${activity}`,
        notes,
      },
      include: {
        caregiver: { select: { name: true, avatar: true } },
      },
    });

    return NextResponse.json({ careNote: note }, { status: 201 });
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
    if (!id) return NextResponse.json({ error: 'Care Note ID required' }, { status: 400 });

    await db.careNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
