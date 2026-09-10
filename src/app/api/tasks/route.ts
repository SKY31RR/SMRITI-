import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || session.patientProfileId;
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!patientId) return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });

    const tasks = await db.careTask.findMany({
      where: { patientId, active: true },
      include: {
        logs: {
          where: { date: dateStr },
        },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return NextResponse.json({ tasks });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, title, category, scheduledTime, recurring, notes } = body;

    if (!patientId || !title || !category || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required task fields' }, { status: 400 });
    }

    const task = await db.careTask.create({
      data: {
        patientId,
        title,
        category,
        scheduledTime,
        recurring: recurring || 'Daily',
        notes: notes || null,
        active: true,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, category, scheduledTime, recurring, notes, active } = body;

    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const updated = await db.careTask.update({
      where: { id },
      data: {
        title,
        category,
        scheduledTime,
        recurring,
        notes: notes || null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ task: updated });
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
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    await db.careTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
