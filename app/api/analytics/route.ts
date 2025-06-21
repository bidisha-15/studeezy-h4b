import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const dummyAnalytics = {
        studyStreak: 2,
        totalDocuments: 3,
        totalFlashcards: 20,
        totalPoints: 3850,
        upcomingAssignments: 4,

        studyTimeBySubject: [
          { subject: 'Computer Science', hours: Math.floor(Math.random() * 3) + 10 },
          { subject: 'Mathematics', hours: Math.floor(Math.random() * 2) + 8 },
          { subject: 'Physics', hours: Math.floor(Math.random() * 2) + 5 },
          { subject: 'History', hours: Math.floor(Math.random() * 1) + 4 },
        ],
        quizPerformance: [
          { date: '2024-05-20', score: 88 },
          { date: '2024-05-13', score: 91 },
          { date: '2024-05-06', score: 76 },
          { date: '2024-04-29', score: 82 },
        ],
        materialUsage: [
          { material: 'Introduction to Algorithms', views: Math.floor(Math.random() * 20) + 40 },
          { material: 'Calculus II Notes', views: Math.floor(Math.random() * 20) + 30 },
          { material: 'Quantum Mechanics Primer', views: Math.floor(Math.random() * 20) + 25 },
          { material: 'The Cold War Overview', views: Math.floor(Math.random() * 20) + 20 },
        ],
        weeklyStudyTime: [
          { day: 'Mon', hours: Math.floor(Math.random() * 3) + 2 },
          { day: 'Tue', hours: Math.floor(Math.random() * 3) + 3 },
          { day: 'Wed', hours: Math.floor(Math.random() * 3) + 1 },
          { day: 'Thu', hours: Math.floor(Math.random() * 3) + 4 },
          { day: 'Fri', hours: Math.floor(Math.random() * 3) + 2 },
          { day: 'Sat', hours: Math.floor(Math.random() * 3) + 5 },
          { day: 'Sun', hours: Math.floor(Math.random() * 3) + 3 },
        ],
      };

    return NextResponse.json(dummyAnalytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 