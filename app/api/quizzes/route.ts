import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        material: {
          select: {
            id: true,
            fileType: true,
          },
        },
        questions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, materialId, questions } = body;

    if (!title || !questions || questions.length === 0) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        userId: session.user.id,
        materialId: materialId || null,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
      include: {
        material: {
          select: {
            id: true,
            fileType: true,
          },
        },
        questions: true,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 