import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        patientProfile: true,
        caregiverProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'PATIENT' | 'CAREGIVER',
      avatar: user.avatar,
      patientProfileId: user.patientProfile?.id,
      caregiverProfileId: user.caregiverProfile?.id,
    };

    const token = signToken(sessionPayload);
    setSessionCookie(token);

    return NextResponse.json({ user: sessionPayload });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  }
}
