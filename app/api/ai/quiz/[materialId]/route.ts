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
    const { title, questionCount = 5 } = body;

    // Get the material and its processed text
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { subject: true },
    });

    if (!material) {
      return new NextResponse('Material not found', { status: 404 });
    }

    if (!material.processedText) {
      return new NextResponse('No processed text available for this material', { status: 400 });
    }

    // Generate quiz using AI
    const prompt = `Based on the following educational content, create ${questionCount} multiple-choice questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

Content: ${material.processedText}

Please format your response as a JSON array with the following structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option text"
  }
]

Make sure the questions are relevant to the content and test understanding of key concepts.`;

    const aiResponse = await askGemini(prompt);
    
    // Parse the AI response to extract questions
    let questions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return new NextResponse('Failed to generate quiz questions', { status: 500 });
    }

    // Create the quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title: title || `Quiz for ${material.title}`,
        userId: session.user.id,
        materialId: materialId,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
      include: {
        questions: true,
        material: {
          select: {
            id: true,
            title: true,
            fileType: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}