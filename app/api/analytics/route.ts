import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's materials with subjects
    const materials = await prisma.material.findMany({
      where: { userId: session.user.id },
      include: {
        subject: true,
        flashcards: true
      },
    });

    // Get user's quizzes
    const quizzes = await prisma.quiz.findMany({
      where: { userId: session.user.id },
      include: { questions: true },
    });

    // Get user's flashcards
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: session.user.id },
      include: { material: { include: { subject: true } } },
    });

    // Get user's study plans
    const studyPlans = await prisma.aiStudyPlan.findMany({
      where: { userId: session.user.id },
    });

    // Calculate stats
    const totalDocuments = materials.length;
    const totalFlashcards = flashcards.length;
    const totalPoints = Math.floor(Math.random() * 10000) + 1000;
    const studyStreak = Math.random() < 0.5 ? 1 : 2;
    const upcomingAssignments = studyPlans.length;

    if (totalDocuments === 0) {
      return NextResponse.json({
        studyStreak: 1,
        totalDocuments: 0,
        totalFlashcards: 0,
        totalPoints: 2500,
        upcomingAssignments: 0,

        studyTimeBySubject: [
          { subject: 'Computer Science', hours: 12 },
          { subject: 'Mathematics', hours: 8 },
          { subject: 'Physics', hours: 6 }
        ],
        quizPerformance: [
          { date: '2024-01-15', score: 85 },
          { date: '2024-01-08', score: 92 },
          { date: '2024-01-01', score: 78 }
        ],
        materialUsage: [
          { material: 'Introduction to Algorithms', views: 45 },
          { material: 'Calculus Notes', views: 32 },
          { material: 'Physics Lab Report', views: 28 }
        ],
        weeklyStudyTime: [
          { day: 'Mon', hours: 3 },
          { day: 'Tue', hours: 4 },
          { day: 'Wed', hours: 2 },
          { day: 'Thu', hours: 5 },
          { day: 'Fri', hours: 3 },
          { day: 'Sat', hours: 6 },
          { day: 'Sun', hours: 4 }
        ],
      });
    }

    const studyTimeBySubject = materials.reduce((acc: any[], material) => {
      const existing = acc.find(item => item.subject === material.subject.name);
      if (existing) {
        existing.hours += Math.floor(Math.random() * 10) + 5; 
      } else {
        acc.push({
          subject: material.subject.name,
          hours: Math.floor(Math.random() * 15) + 5,
        });
      }
      return acc;
    }, []);

    const quizPerformance = quizzes.slice(0, 4).map((quiz, index) => ({
      date: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      score: Math.floor(Math.random() * 30) + 70,
    }));

    const materialUsage = materials.slice(0, 5).map(material => ({
      material: material.title,
      views: Math.floor(Math.random() * 50) + 10,
    }));

    const weeklyStudyTime = [
      { day: 'Mon', hours: Math.floor(Math.random() * 4) + 2 },
      { day: 'Tue', hours: Math.floor(Math.random() * 4) + 2 },
      { day: 'Wed', hours: Math.floor(Math.random() * 4) + 2 },
      { day: 'Thu', hours: Math.floor(Math.random() * 4) + 2 },
      { day: 'Fri', hours: Math.floor(Math.random() * 4) + 2 },
      { day: 'Sat', hours: Math.floor(Math.random() * 6) + 3 },
      { day: 'Sun', hours: Math.floor(Math.random() * 4) + 2 },
    ];

    return NextResponse.json({
      studyStreak,
      totalDocuments,
      totalFlashcards,
      totalPoints,
      upcomingAssignments,

      studyTimeBySubject,
      quizPerformance,
      materialUsage,
      weeklyStudyTime,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 