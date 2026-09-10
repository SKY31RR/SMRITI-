import { NextResponse } from 'next/server';
import { generateSMRITIResponse } from '@/lib/ai';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { prompt, contextType, patientName, recentObservations, medicationsSummary } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const aiResult = await generateSMRITIResponse({
      prompt,
      contextType,
      patientName,
      recentObservations,
      medicationsSummary,
    });

    return NextResponse.json(aiResult);
  } catch (e: any) {
    console.error('AI assistant error:', e);
    return NextResponse.json({ error: 'Failed to process SMRITI AI request' }, { status: 500 });
  }
}
