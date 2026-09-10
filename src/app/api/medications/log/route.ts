import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { medicationId, patientId, status = 'TAKEN', logId } = body;

    if (!medicationId || !patientId) {
      return NextResponse.json({ error: 'Medication ID and Patient ID are required' }, { status: 400 });
    }

    let medicationLog;

    if (logId) {
      medicationLog = await db.medicationLog.update({
        where: { id: logId },
        data: {
          status,
          takenAt: status === 'TAKEN' ? new Date() : null,
          takenByUserId: session.id,
        },
      });
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      medicationLog = await db.medicationLog.create({
        data: {
          medicationId,
          patientId,
          scheduledFor: `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          status,
          takenAt: status === 'TAKEN' ? new Date() : null,
          takenByUserId: session.id,
        },
      });
    }

    // Also trigger notification for caregiver if taken by patient
    if (session.role === 'PATIENT') {
      const med = await db.medication.findUnique({ where: { id: medicationId } });
      await db.notification.create({
        data: {
          userId: session.id, // Or caregiver user ID
          title: 'Medication Taken',
          message: `${session.name} marked ${med?.name || 'medication'} as taken.`,
          type: 'MEDICATION',
        },
      });
    }

    return NextResponse.json({ log: medicationLog });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
