import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return new NextResponse('Not a member of this group', { status: 403 });
    }

    // Check if user is the creator (admin) of the group
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (group?.createdById === session.user.id) {
      return new NextResponse('Group creator cannot leave. Transfer ownership or delete the group.', { status: 400 });
    }

    // Remove user from the group
    await prisma.groupMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Error leaving group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 