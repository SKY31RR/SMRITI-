import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'PATIENT') {
      const patient = await db.patientProfile.findFirst({
        where: { userId: session.id },
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          emergencyContacts: true,
        },
      });
      return NextResponse.json({ patient });
    }

    const patients = await db.patientProfile.findMany({
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        medications: { where: { active: true } },
        careTasks: { where: { active: true } },
        appointments: { orderBy: { date: 'asc' } },
        safetyAlerts: { where: { status: 'ACTIVE' } },
      },
    });

    return NextResponse.json({ patients });
  } catch (error: any) {
    console.error('Fetch patients error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
