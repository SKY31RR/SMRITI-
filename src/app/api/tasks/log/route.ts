import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { taskId, patientId, completed, date } = body;

    const dateStr = date || new Date().toISOString().split('T')[0];

    if (!taskId || !patientId) {
      return NextResponse.json({ error: 'Task ID and Patient ID are required' }, { status: 400 });
    }

    const existingLog = await db.taskLog.findFirst({
      where: { taskId, date: dateStr },
    });

    let log;
    if (existingLog) {
      log = await db.taskLog.update({
        where: { id: existingLog.id },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
          completedByUserId: session.id,
        },
      });
    } else {
      log = await db.taskLog.create({
        data: {
          taskId,
          patientId,
          date: dateStr,
          completed,
          completedAt: completed ? new Date() : null,
          completedByUserId: session.id,
        },
      });
    }

    return NextResponse.json({ log });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
