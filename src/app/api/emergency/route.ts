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

    const contacts = await db.emergencyContact.findMany({
      where: { patientId },
      orderBy: { isPrimary: 'desc' },
    });

    const alerts = await db.safetyAlert.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ contacts, alerts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, patientId, alertId, message } = body;

    // Action 1: Patient triggers Emergency SOS assistance request
    if (action === 'TRIGGER_SOS') {
      const targetPatientId = patientId || session.patientProfileId;
      if (!targetPatientId) return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });

      const alert = await db.safetyAlert.create({
        data: {
          patientId: targetPatientId,
          alertType: 'EMERGENCY_BUTTON',
          message: message || `EMERGENCY ALERT: ${session.name} activated immediate care assistance button!`,
          severity: 'HIGH',
          status: 'ACTIVE',
        },
      });

      // Find caregivers for this patient to notify
      const relationships = await db.patientCaregiverRelationship.findMany({
        where: { patientId: targetPatientId },
        include: { caregiver: { include: { user: true } } },
      });

      for (const rel of relationships) {
        if (rel.caregiver?.user) {
          await db.notification.create({
            data: {
              userId: rel.caregiver.user.id,
              title: '🚨 EMERGENCY CARE ALERT',
              message: `${session.name} pressed emergency assistance button!`,
              type: 'SAFETY',
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        alert,
        demoNotice: 'Demo Mode: Emergency alert recorded in SMRITI database and notified active caregivers. In production, this connects via WebHook/Twilio API to local first responders.',
      });
    }

    // Action 2: Caregiver acknowledges alert
    if (action === 'ACKNOWLEDGE_ALERT') {
      if (!alertId) return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });

      const updated = await db.safetyAlert.update({
        where: { id: alertId },
        data: { status: 'ACKNOWLEDGED' },
      });

      return NextResponse.json({ alert: updated });
    }

    return NextResponse.json({ error: 'Invalid emergency action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
