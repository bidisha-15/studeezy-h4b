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
        linkedMaterials: {
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
        date: 'asc',
      },
    });

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
    const { title, date, materialIds } = body;

    if (!title || !date) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const plan = await prisma.aiStudyPlan.create({
      data: {
        // title,
        date: new Date(date),
        userId: session.user.id,
        linkedMaterials: {
          create: materialIds.map((materialId: string) => ({
            materialId,
          })),
        },
      },
      include: {
        linkedMaterials: {
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