import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { askGemini } from '@/lib/gemini';

export async function POST(
  req: Request,
  { params }: { params: { materialId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { materialId } = params;
    const body = await req.json();
    const { flashcardCount = 10 } = body;

    console.log(`Generating ${flashcardCount} flashcards for material: ${materialId}`);

    // Get the material and its processed text
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { subject: true },
    });

    if (!material) {
      console.error(`Material not found: ${materialId}`);
      return new NextResponse('Material not found', { status: 404 });
    }

    if (!material.processedText) {
      console.error(`No processed text for material: ${materialId}`);
      return new NextResponse('No processed text available for this material', { status: 400 });
    }

    console.log(`Material found: ${material.title}, Subject: ${material.subject.name}`);
    console.log(`Processed text length: ${material.processedText.length} characters`);

    // Generate flashcards using AI with improved prompt for better memorization
    const prompt = `Based on the following educational content from ${material.subject.name}, create ${flashcardCount} high-quality flashcards designed for effective memorization and learning.

Content: ${material.processedText}

Create flashcards that follow these principles:
1. **Concept Understanding**: Questions that test understanding, not just memorization
2. **Active Recall**: Questions that require active thinking rather than passive recognition
3. **Clarity**: Clear, unambiguous questions and concise, accurate answers
4. **Variety**: Mix of different question types (definitions, applications, comparisons, processes)
5. **Progressive Difficulty**: Start with foundational concepts and progress to more complex ones
6. **Practical Application**: Include questions that connect theory to real-world scenarios

Question Types to Include:
- Definition/Concept questions
- Process/Step-by-step questions
- Comparison/Contrast questions
- Application/Scenario questions
- Cause-and-effect questions
- Problem-solving questions

Format your response as a JSON array:
[
  {
    "question": "Clear, specific question that tests understanding",
    "answer": "Concise, accurate answer that reinforces learning"
  }
]

Focus on the most important concepts that students need to remember and understand. Make each flashcard valuable for long-term retention.`;

    console.log('Sending prompt to Gemini...');
    const aiResponse = await askGemini(prompt);
    console.log('Received response from Gemini, length:', aiResponse.length);
    
    // Parse the AI response to extract flashcards
    let flashcards;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
        console.log(`Successfully parsed ${flashcards.length} flashcards from AI response`);
      } else {
        console.error('No valid JSON found in AI response');
        console.error('AI Response:', aiResponse);
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw AI response:', aiResponse);
      return new NextResponse('Failed to generate flashcards - invalid AI response format', { status: 500 });
    }

    // Validate flashcards structure
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      console.error('Invalid flashcard format generated:', flashcards);
      return new NextResponse('Invalid flashcard format generated', { status: 500 });
    }

    console.log('Creating flashcards in database...');

    // Create flashcards in the database
    const createdFlashcards = await Promise.all(
      flashcards.map(async (flashcard: any, index: number) => {
        // Validate each flashcard has required fields
        if (!flashcard.question || !flashcard.answer) {
          console.error(`Invalid flashcard at index ${index}:`, flashcard);
          throw new Error(`Invalid flashcard structure at index ${index}`);
        }
        
        console.log(`Creating flashcard ${index + 1}:`, {
          question: flashcard.question.substring(0, 50) + '...',
          answer: flashcard.answer.substring(0, 50) + '...'
        });

        return prisma.flashcard.create({
          data: {
            question: flashcard.question.trim(),
            answer: flashcard.answer.trim(),
            userId: session.user.id,
            materialId: materialId,
          },
          include: {
            material: {
              select: {
                id: true,
                title: true,
                fileType: true,
              },
            },
          },
        });
      })
    );

    console.log(`Successfully created ${createdFlashcards.length} flashcards in database`);

    // Verify the flashcards were actually saved
    const savedFlashcards = await prisma.flashcard.findMany({
      where: {
        materialId: materialId,
        userId: session.user.id,
      },
      orderBy: {
        id: 'desc',
      },
      take: createdFlashcards.length,
    });

    console.log(`Verified ${savedFlashcards.length} flashcards in database`);

    return NextResponse.json(createdFlashcards);
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}