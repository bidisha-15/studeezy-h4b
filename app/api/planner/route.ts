import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const plans = await prisma.aiStudyPlan.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subject: true,
        materials: {
          include: {
            material: {
              select: {
                id: true,
                fileType: true,
                title: true,
                subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If no plans exist, return sample data for demonstration
    if (plans.length === 0) {
      return NextResponse.json([
        {
          id: 'sample-plan-1',
          timeFrame: 'This week',
          subject: { name: 'Computer Science' },
          materials: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample-plan-2',
          timeFrame: 'Next week',
          subject: { name: 'Mathematics' },
          materials: [],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching study plans:', error);
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
    const { timeFrame, subjectId, materialIds } = body;

    if (!timeFrame || !subjectId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const plan = await prisma.aiStudyPlan.create({
      data: {
        timeFrame,
        subjectId,
        userId: session.user.id,
        plan: {}, // Empty plan object for now
        materials: {
          create: (materialIds || []).map((materialId: string) => ({
            materialId,
          })),
        },
      },
      include: {
        subject: true,
        materials: {
          include: {
            material: {
              select: {
                id: true,
                fileType: true,
                title: true,
                subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating study plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 