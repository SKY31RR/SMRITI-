import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || session.patientProfileId;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const medications = await db.medication.findMany({
      where: { patientId },
      include: {
        logs: {
          orderBy: { scheduledFor: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ medications });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden: Only caregivers can create medications' }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, name, dosage, frequency, timesOfDay, startDate, endDate, notes } = body;

    if (!patientId || !name || !dosage || !frequency || !timesOfDay || !startDate) {
      return NextResponse.json({ error: 'Missing required medication fields' }, { status: 400 });
    }

    const medication = await db.medication.create({
      data: {
        patientId,
        name,
        dosage,
        frequency,
        timesOfDay,
        startDate,
        endDate: endDate || null,
        notes: notes || null,
        active: true,
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    await db.medicationLog.create({
      data: {
        medicationId: medication.id,
        patientId,
        scheduledFor: `${todayStr} ${timesOfDay.split(',')[0].trim()}`,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ medication }, { status: 201 });
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
    const { id, name, dosage, frequency, timesOfDay, startDate, endDate, notes, active } = body;

    if (!id) return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });

    const updated = await db.medication.update({
      where: { id },
      data: {
        name,
        dosage,
        frequency,
        timesOfDay,
        startDate,
        endDate: endDate || null,
        notes: notes || null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ medication: updated });
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
    if (!id) return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });

    await db.medication.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
