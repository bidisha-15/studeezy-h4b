import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const flashcards = await prisma.flashcard.findMany({
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
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { question, answer, materialId } = body;

    if (!question || !answer) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        userId: session.user.id,
        materialId: materialId || null,
      },
      include: {
        material: {
          select: {
            id: true,
            fileType: true,
          },
        },
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 