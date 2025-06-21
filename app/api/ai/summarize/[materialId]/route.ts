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
    const { summaryLength = 'medium' } = body;

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

    // Determine summary length
    let lengthInstruction = '';
    switch (summaryLength) {
      case 'short':
        lengthInstruction = 'Create a concise summary in 2-3 paragraphs.';
        break;
      case 'long':
        lengthInstruction = 'Create a detailed summary in 5-7 paragraphs.';
        break;
      default:
        lengthInstruction = 'Create a comprehensive summary in 3-4 paragraphs.';
    }

    // Generate summary using AI
    const prompt = `Based on the following educational content, ${lengthInstruction}

Content: ${material.processedText}

Please provide a well-structured summary that:
1. Captures the main concepts and key points
2. Is organized in a logical flow
3. Uses clear and concise language
4. Highlights important definitions, formulas, or concepts
5. Is suitable for study and review purposes

Format the summary with proper paragraphs and structure.`;

    const summary = await askGemini(prompt);

    return NextResponse.json({
      materialId,
      summary,
      summaryLength,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}