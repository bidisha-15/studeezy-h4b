import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
// import { getCompletion } from '@/lib/geminiServices';

// NOTE: This route is currently returning dummy data for frontend development
// due to database and prisma generation issues.

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { subjectId, materialIds, timeFrame } = body;

    console.log("Request for AI plan received:", { subjectId, materialIds, timeFrame });

    // Simulate a delay as if the AI is generating the plan
    await new Promise(resolve => setTimeout(resolve, 2000));

    const dummyAiPlan = {
      id: `ai-plan-${Math.floor(Math.random() * 1000)}`,
      userId,
      subjectId,
      timeFrame,
      plan: {
        summary: `This is a dummy AI-generated study plan for ${timeFrame}. It's designed to provide a comprehensive overview of the selected materials, focusing on key concepts and practical applications to ensure a robust understanding of the subject.`,
        steps: [
          {
            title: 'Day 1-2: Foundational Concepts',
            goal: 'Review the introductory materials to build a strong base. Focus on understanding the core definitions and theories.',
            materialTitle: 'Introduction to Subject',
            materialId: materialIds[0] || 'dummy-material-id-1'
          },
          {
            title: 'Day 3-4: Deep Dive into Core Topics',
            goal: 'Explore the main chapters of the textbook. Complete the end-of-chapter exercises to test your knowledge.',
            materialTitle: 'Core Textbook',
            materialId: materialIds[1] || 'dummy-material-id-2'
          },
          {
            title: 'Day 5: Practical Application',
            goal: 'Work through the case study material to see how the concepts are applied in real-world scenarios.',
            materialTitle: 'Case Studies',
            materialId: materialIds[2] || 'dummy-material-id-3'
          },
          {
            title: 'Day 6-7: Revision and Practice',
            goal: 'Review all notes and attempt practice questions. Identify weak areas and revisit the relevant materials.',
            materialTitle: 'Practice Questions compilation',
            materialId: materialIds[0] || 'dummy-material-id-1'
          }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(dummyAiPlan, { status: 201 });

  } catch (error) {
    console.error('Error generating AI study plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 