import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const plan = await prisma.studyPlan.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!plan) {
      return new NextResponse('Study plan not found', { status: 404 });
    }

    if (plan.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.studyPlan.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting study plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 