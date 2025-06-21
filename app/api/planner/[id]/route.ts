import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params;

    const plan = await prisma.aiStudyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return new NextResponse('Study plan not found', { status: 404 });
    }

    if (plan.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.aiStudyPlan.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting study plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}