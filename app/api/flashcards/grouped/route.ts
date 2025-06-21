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

    console.log(`Fetching flashcards for user: ${session.user.id}`);

    // Get all flashcards with their materials, subjects, and tags
    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId: session.user.id,
        material: {
          isNot: null, // Only flashcards with associated materials
        },
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

    console.log(`Found ${flashcards.length} total flashcards`);

    // Group flashcards by material
    const groupedFlashcards = flashcards.reduce((acc, flashcard) => {
      const materialId = flashcard.materialId!;
      
      if (!acc[materialId]) {
        acc[materialId] = {
          material: {
            id: flashcard.material!.id,
            title: flashcard.material!.title,
            subject: flashcard.material!.subject,
            materialTags: flashcard.material!.materialTags,
          },
          flashcards: [],
        };
      }
      
      acc[materialId].flashcards.push({
        id: flashcard.id,
        question: flashcard.question,
        answer: flashcard.answer,
      });
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by material title
    const result = Object.values(groupedFlashcards).sort((a: any, b: any) => 
      a.material.title.localeCompare(b.material.title)
    );

    console.log(`Grouped into ${result.length} materials with flashcards`);
    result.forEach((group: any) => {
      console.log(`- ${group.material.title}: ${group.flashcards.length} flashcards`);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching grouped flashcards:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 