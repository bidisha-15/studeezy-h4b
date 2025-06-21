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

    // If no materials exist, return sample data for demonstration
    if (materials.length === 0) {
      return NextResponse.json([
        {
          id: 'sample-1',
          title: 'Introduction to Machine Learning',
          fileName: 'ml-intro.pdf',
          fileType: 'application/pdf',
          fileSize: 2048576,
          fileUrl: '#',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          processedText: 'Sample processed text for machine learning introduction...',
          subject: { name: 'Computer Science', code: 'CS101' },
          materialTags: []
        },
        {
          id: 'sample-2',
          title: 'Calculus Problem Set',
          fileName: 'calculus-ps.pdf',
          fileType: 'application/pdf',
          fileSize: 1536000,
          fileUrl: '#',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          processedText: 'Sample processed text for calculus problems...',
          subject: { name: 'Mathematics', code: 'MATH201' },
          materialTags: []
        },
        {
          id: 'sample-3',
          title: 'Physics Lab Report',
          fileName: 'physics-lab.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: 512000,
          fileUrl: '#',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          processedText: 'Sample processed text for physics lab report...',
          subject: { name: 'Physics', code: 'PHY101' },
          materialTags: []
        }
      ]);
    }

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
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
