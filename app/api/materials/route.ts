import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getImageOCR, understandDoc } from '@/lib/geminiServices';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const materials = await prisma.material.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subject: true,
        materialTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
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
    const { title, fileName, fileType, fileSize, fileUrl, subjectId, tagIds } = body;

    if (!fileUrl || !title || !subjectId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    let processedText = '';

    // Perform OCR processing based on file type using the Edgestore URL
    try {
      if (fileType.startsWith('image/')) {
        // images, getImageOCR
        const prompt = "Extract all text from this image. Include any mathematical equations, diagrams, or structured content. Format the output clearly.";
        processedText = await getImageOCR(fileUrl, prompt) || '';
      } else if (fileType === 'application/pdf') {
        // PDFs, understandDoc
        processedText = await understandDoc(fileUrl) || '';
      }
    } catch (ocrError) {
      console.error('OCR processing failed:', ocrError);
    }

    const material = await prisma.material.create({
      data: {
        title,
        fileName,
        fileType,
        fileSize,
        fileUrl,
        userId: session.user.id,
        subjectId,
        processedText,
        materialTags: {
          create: (tagIds || []).map((tagId: string) => ({
            tagId,
          })),
        },
      },
      include: {
        subject: true,
        materialTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
