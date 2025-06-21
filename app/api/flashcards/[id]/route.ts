import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    console.log(`Fetching flashcards for material ID: ${id}`);

    const flashcards = await prisma.flashcard.findMany({
      where: {
        materialId: id,
        userId: session.user.id,
      },
      include: {
        material: {
          include: {
            subject: true,
            materialTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    console.log(`Found ${flashcards.length} flashcards for material ${id}`);

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    const flashcard = await prisma.flashcard.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!flashcard) {
      return new NextResponse('Flashcard not found', { status: 404 });
    }

    await prisma.flashcard.delete({
      where: { id },
    });

    return new NextResponse('Flashcard deleted successfully');
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 