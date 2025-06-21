import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = context.params
  
  try {
    // First verify the subject exists and belongs to the user
    const subject = await prisma.subject.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    if (subject.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all materials for this subject
    const materials = await prisma.material.findMany({
      where: {
        subjectId: id,
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

    return NextResponse.json({
      subject,
      materials,
    });
  } catch (error) {
    console.error('Error fetching materials by subject:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 