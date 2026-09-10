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

    const appointments = await db.appointment.findMany({
      where: { patientId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });

    return NextResponse.json({ appointments });
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
    const { patientId, title, date, time, provider, location, notes } = body;

    if (!patientId || !title || !date || !time || !provider || !location) {
      return NextResponse.json({ error: 'Missing required appointment fields' }, { status: 400 });
    }

    const appointment = await db.appointment.create({
      data: {
        patientId,
        title,
        date,
        time,
        provider,
        location,
        notes: notes || null,
        status: 'SCHEDULED',
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
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
    const { id, title, date, time, provider, location, notes, status } = body;

    if (!id) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });

    const updated = await db.appointment.update({
      where: { id },
      data: {
        title,
        date,
        time,
        provider,
        location,
        notes: notes || null,
        status: status || 'SCHEDULED',
      },
    });

    return NextResponse.json({ appointment: updated });
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
    if (!id) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });

    await db.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
