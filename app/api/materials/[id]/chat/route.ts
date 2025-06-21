import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCompletion } from '@/lib/geminiServices'; 

interface ChatMessage {
  message: string;
}

interface ChatResponse {
  id: string;
  content: string;
  role: 'assistant';
  timestamp: string;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as ChatMessage;
    console.log(body);
    
    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    const {id} = await params;

    const material = await prisma.material.findUnique({
      where: { id },
      select: {
        id: true,
        processedText: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }
    console.log(material);

    
    if (!material.processedText) {
      return NextResponse.json(
        { error: 'No processed text available for this material' },
        { status: 400 }
      );
    }

    const prompt = `Document: ${material.processedText}\n\nUser Query: ${body.message}`;
    console.log("bckedn propt---->", prompt);
    const geminiResponse = await getCompletion(prompt);

    console.log('Gemini API returned:', geminiResponse);

    const response: ChatResponse = {
      id: Date.now().toString(),
      content: geminiResponse || 'No response from Gemini.',
      role: 'assistant',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

