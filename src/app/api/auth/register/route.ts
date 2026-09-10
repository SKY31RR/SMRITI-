import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password, role, phone, dateOfBirth, diagnosisNotes } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: role.toUpperCase() === 'PATIENT' ? 'PATIENT' : 'CAREGIVER',
        avatar: role.toUpperCase() === 'PATIENT' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        ...(role.toUpperCase() === 'PATIENT'
          ? {
              patientProfile: {
                create: {
                  dateOfBirth: dateOfBirth || null,
                  diagnosisNotes: diagnosisNotes || 'Newly registered patient profile.',
                },
              },
            }
          : {
              caregiverProfile: {
                create: {
                  phone: phone || null,
                  relationshipRole: 'Primary Caregiver',
                },
              },
            }),
      },
      include: {
        patientProfile: true,
        caregiverProfile: true,
      },
    });

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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error during registration' }, { status: 500 });
  }
}
