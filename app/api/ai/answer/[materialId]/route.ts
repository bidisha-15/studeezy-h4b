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
    const { question } = body;

    if (!question?.trim()) {
      return new NextResponse('Question is required', { status: 400 });
    }

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

    // Generate answer using AI
    const prompt = `Based on the following educational content, please answer the user's question.

Content: ${material.processedText}

Question: ${question}

Please provide a comprehensive answer that:
1. Directly addresses the question asked
2. Uses information from the provided content
3. Is clear and well-explained
4. Includes relevant examples or explanations when helpful
5. Is educational and informative

If the question cannot be answered using the provided content, please state that clearly and suggest what additional information might be needed.`;

    const answer = await askGemini(prompt);

    return NextResponse.json({
      materialId,
      question,
      answer,
      answeredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating answer:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

