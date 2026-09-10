import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SMRITI database...');

  // Clean existing tables
  await prisma.notification.deleteMany();
  await prisma.safetyAlert.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.memoryPerson.deleteMany();
  await prisma.careNote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.taskLog.deleteMany();
  await prisma.careTask.deleteMany();
  await prisma.medicationLog.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.patientCaregiverRelationship.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Create Caregiver User 1 (Primary)
  const caregiverUser1 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins',
      email: 'caregiver@smriti.care',
      passwordHash: hashedPassword,
      role: 'CAREGIVER',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
      caregiverProfile: {
        create: {
          phone: '(555) 234-5678',
          relationshipRole: 'Lead Memory Care Specialist',
          notes: 'Assigned primary supervisor for cognitive care routines.',
        },
      },
    },
    include: { caregiverProfile: true },
  });

  // 2. Create Caregiver User 2 (Family Member)
  const caregiverUser2 = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@smriti.care',
      passwordHash: hashedPassword,
      role: 'CAREGIVER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      caregiverProfile: {
        create: {
          phone: '(555) 876-5432',
          relationshipRole: 'Son & Primary Family Representative',
          notes: 'Manages weekend visits and family memory activities.',
        },
      },
    },
    include: { caregiverProfile: true },
  });

  // 3. Create Patient User 1 (Eleanor Vance)
  const patientUser1 = await prisma.user.create({
    data: {
      name: 'Eleanor Vance',
      email: 'eleanor@smriti.care',
      passwordHash: hashedPassword,
      role: 'PATIENT',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      patientProfile: {
        create: {
          dateOfBirth: '1948-04-12',
          diagnosisNotes: 'Mild-to-moderate Alzheimer’s Disease diagnosed 2024. Responds warmly to classical music and photo memories.',
          emergencyNotes: 'Allergic to penicillin. Uses walking stick for evening strolls.',
          roomOrAddress: 'Maple Wood Suite 204',
        },
      },
    },
    include: { patientProfile: true },
  });

  // 4. Create Patient User 2 (Arthur Pendelton)
  const patientUser2 = await prisma.user.create({
    data: {
      name: 'Arthur Pendelton',
      email: 'arthur@smriti.care',
      passwordHash: hashedPassword,
      role: 'PATIENT',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      patientProfile: {
        create: {
          dateOfBirth: '1942-09-28',
          diagnosisNotes: 'Vascular Dementia. Loves gardening conversations and morning teas.',
          emergencyNotes: 'Monitored for mild vertigo.',
          roomOrAddress: 'Oak Cottage Room 12',
        },
      },
    },
    include: { patientProfile: true },
  });

  // 5. Establish Patient-Caregiver Relationships
  if (patientUser1.patientProfile && caregiverUser1.caregiverProfile) {
    await prisma.patientCaregiverRelationship.create({
      data: {
        patientId: patientUser1.patientProfile.id,
        caregiverId: caregiverUser1.caregiverProfile.id,
        accessLevel: 'PRIMARY',
        status: 'ACTIVE',
      },
    });
  }

  if (patientUser1.patientProfile && caregiverUser2.caregiverProfile) {
    await prisma.patientCaregiverRelationship.create({
      data: {
        patientId: patientUser1.patientProfile.id,
        caregiverId: caregiverUser2.caregiverProfile.id,
        accessLevel: 'FAMILY',
        status: 'ACTIVE',
      },
    });
  }

  if (patientUser2.patientProfile && caregiverUser1.caregiverProfile) {
    await prisma.patientCaregiverRelationship.create({
      data: {
        patientId: patientUser2.patientProfile.id,
        caregiverId: caregiverUser1.caregiverProfile.id,
        accessLevel: 'PRIMARY',
        status: 'ACTIVE',
      },
    });
  }

  const eleanorProfileId = patientUser1.patientProfile!.id;

  // 6. Seed Medications for Eleanor
  const med1 = await prisma.medication.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Donepezil (Aricept)',
      dosage: '10 mg',
      frequency: 'Once Daily',
      timesOfDay: '08:00',
      startDate: '2025-01-10',
      notes: 'Take in the morning with food or water.',
      active: true,
    },
  });

  const med2 = await prisma.medication.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Memantine (Namenda)',
      dosage: '10 mg',
      frequency: 'Twice Daily',
      timesOfDay: '08:00, 20:00',
      startDate: '2025-02-01',
      notes: 'Supports neurotransmitter signaling.',
      active: true,
    },
  });

  const med3 = await prisma.medication.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Lisinfopril',
      dosage: '5 mg',
      frequency: 'Once Daily',
      timesOfDay: '08:00',
      startDate: '2024-11-15',
      notes: 'Blood pressure maintenance.',
      active: true,
    },
  });

  const med4 = await prisma.medication.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Omega-3 & Vitamin D3',
      dosage: '1 Capsule',
      frequency: 'Once Daily',
      timesOfDay: '12:30',
      startDate: '2024-06-01',
      notes: 'Nutritional supplement with lunch.',
      active: true,
    },
  });

  // 7. Seed Medication Logs for Today
  await prisma.medicationLog.createMany({
    data: [
      {
        medicationId: med1.id,
        patientId: eleanorProfileId,
        scheduledFor: `${todayStr} 08:00`,
        takenAt: new Date(),
        status: 'TAKEN',
        takenByUserId: caregiverUser1.id,
      },
      {
        medicationId: med2.id,
        patientId: eleanorProfileId,
        scheduledFor: `${todayStr} 08:00`,
        takenAt: new Date(),
        status: 'TAKEN',
        takenByUserId: caregiverUser1.id,
      },
      {
        medicationId: med3.id,
        patientId: eleanorProfileId,
        scheduledFor: `${todayStr} 08:00`,
        takenAt: new Date(),
        status: 'TAKEN',
        takenByUserId: caregiverUser1.id,
      },
      {
        medicationId: med4.id,
        patientId: eleanorProfileId,
        scheduledFor: `${todayStr} 12:30`,
        status: 'PENDING',
      },
      {
        medicationId: med2.id,
        patientId: eleanorProfileId,
        scheduledFor: `${todayStr} 20:00`,
        status: 'PENDING',
      },
    ],
  });

  // 8. Seed Care Tasks for Eleanor
  const task1 = await prisma.careTask.create({
    data: {
      patientId: eleanorProfileId,
      title: 'Morning Warm Tea & Hydration',
      category: 'Hydration',
      scheduledTime: '08:30',
      notes: 'Chamomile tea with a touch of honey.',
    },
  });

  const task2 = await prisma.careTask.create({
    data: {
      patientId: eleanorProfileId,
      title: 'Garden Patio Walk & Sun Exposure',
      category: 'Walk',
      scheduledTime: '10:30',
      notes: 'Gentle 15-minute stroll in the courtyard.',
    },
  });

  const task3 = await prisma.careTask.create({
    data: {
      patientId: eleanorProfileId,
      title: 'Memory Family Photo Album Review',
      category: 'Memory activity',
      scheduledTime: '15:00',
      notes: 'Look at Cape Cod trip album and discuss family names.',
    },
  });

  const task4 = await prisma.careTask.create({
    data: {
      patientId: eleanorProfileId,
      title: 'Soft Classical Music & Evening Rest',
      category: 'Rest',
      scheduledTime: '19:00',
      notes: 'Play Mozart or Chopin piano sonatas.',
    },
  });

  // Task Logs for Today
  await prisma.taskLog.createMany({
    data: [
      {
        taskId: task1.id,
        patientId: eleanorProfileId,
        date: todayStr,
        completed: true,
        completedAt: new Date(),
        completedByUserId: patientUser1.id,
      },
      {
        taskId: task2.id,
        patientId: eleanorProfileId,
        date: todayStr,
        completed: true,
        completedAt: new Date(),
        completedByUserId: caregiverUser1.id,
      },
      {
        taskId: task3.id,
        patientId: eleanorProfileId,
        date: todayStr,
        completed: false,
      },
      {
        taskId: task4.id,
        patientId: eleanorProfileId,
        date: todayStr,
        completed: false,
      },
    ],
  });

  // 9. Seed Appointments for Eleanor
  await prisma.appointment.createMany({
    data: [
      {
        patientId: eleanorProfileId,
        title: 'Neurology Cognitive Assessment',
        date: '2026-08-28',
        time: '10:00',
        provider: 'Dr. Robert Evans, MD',
        location: 'St. Jude Memory Wellness Center, Room 302',
        notes: 'Routine quarterly checkup. Bring medication list and care observation notes.',
        status: 'SCHEDULED',
      },
      {
        patientId: eleanorProfileId,
        title: 'Gentle Physical Therapy & Balance Class',
        date: '2026-08-30',
        time: '14:00',
        provider: 'Clara Oswald, PT',
        location: 'Wellness Studio B',
        notes: 'Focus on gait stability and leg strength.',
        status: 'SCHEDULED',
      },
    ],
  });

  // 10. Seed Care Notes / Observations
  await prisma.careNote.createMany({
    data: [
      {
        patientId: eleanorProfileId,
        caregiverId: caregiverUser1.id,
        mood: 'Peaceful',
        activity: 'Family Visit & Tea',
        tags: 'Peaceful, Responsive, Family',
        notes: 'Eleanor smiled brightly when seeing Marcus today. Recognized him immediately and enjoyed sharing stories about her garden.',
      },
      {
        patientId: eleanorProfileId,
        caregiverId: caregiverUser1.id,
        mood: 'Calm',
        activity: 'Morning Walk',
        tags: 'Outdoors, Exercise, Calm',
        notes: 'Completed 2 laps around the courtyard without agitation. Slept well last night (7.5 hours uninterrupted).',
      },
    ],
  });

  // 11. Seed Memory People ("My People")
  const person1 = await prisma.memoryPerson.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Marcus Vance',
      relationship: 'Son',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      description: 'Your beloved son who visits every weekend. He loves architecture and garden design.',
      contactPhone: '(555) 876-5432',
      notes: 'Loves bringing blueberry scones.',
    },
  });

  const person2 = await prisma.memoryPerson.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Sarah Vance',
      relationship: 'Daughter',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      description: 'Your caring daughter who lives in Boston. You baked pie together every Thanksgiving.',
      contactPhone: '(555) 998-1122',
      notes: 'Calls every Tuesday afternoon.',
    },
  });

  const person3 = await prisma.memoryPerson.create({
    data: {
      patientId: eleanorProfileId,
      name: 'Leo & Oliver',
      relationship: 'Grandchildren',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      description: 'Your energetic grandsons who love playing in your backyard garden.',
      notes: 'Leo plays cello; Oliver loves soccer.',
    },
  });

  // 12. Seed Memories
  await prisma.memory.createMany({
    data: [
      {
        patientId: eleanorProfileId,
        memoryPersonId: person2.id,
        title: 'Cape Cod Family Cottage Summer',
        description: 'A sunny afternoon sitting on the porch watching the waves with Sarah and Marcus playing in the sand.',
        memoryDate: 'July 1984',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
      {
        patientId: eleanorProfileId,
        memoryPersonId: person1.id,
        title: 'Planting the Rose Garden',
        description: 'Marcus helped plant the yellow roses by the sunroom window. They bloomed every spring.',
        memoryDate: 'May 1999',
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
      },
    ],
  });

  // 13. Seed Emergency Contacts
  await prisma.emergencyContact.createMany({
    data: [
      {
        patientId: eleanorProfileId,
        name: 'Marcus Vance',
        relationship: 'Son / Primary Emergency Proxy',
        phone: '(555) 876-5432',
        isPrimary: true,
      },
      {
        patientId: eleanorProfileId,
        name: 'Dr. Sarah Jenkins',
        relationship: 'Memory Care Physician',
        phone: '(555) 234-5678',
        isPrimary: false,
      },
      {
        patientId: eleanorProfileId,
        name: 'St. Jude Emergency Response',
        relationship: 'Local Emergency Dispatch',
        phone: '911 / (555) 911-0000',
        isPrimary: false,
      },
    ],
  });

  // 14. Seed Safety Alerts
  await prisma.safetyAlert.create({
    data: {
      patientId: eleanorProfileId,
      alertType: 'SCHEDULED_CARE_CHECK',
      message: 'Routine afternoon hydration check scheduled.',
      severity: 'LOW',
      status: 'ACKNOWLEDGED',
    },
  });

  // 15. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: caregiverUser1.id,
        title: 'Medication Logged',
        message: 'Donepezil 10mg logged for Eleanor Vance at 08:00 AM.',
        type: 'MEDICATION',
        isRead: true,
      },
      {
        userId: caregiverUser1.id,
        title: 'Upcoming Assessment',
        message: 'Neurology appointment scheduled for Aug 28 at 10:00 AM.',
        type: 'APPOINTMENT',
        isRead: false,
      },
      {
        userId: patientUser1.id,
        title: 'Morning Routine Complete',
        message: 'Great job completing your morning tea and walk today!',
        type: 'TASK',
        isRead: false,
      },
    ],
  });

  console.log('Seeding complete successfully!');
  console.log('Caregiver Login: caregiver@smriti.care / password123');
  console.log('Patient Login: eleanor@smriti.care / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
