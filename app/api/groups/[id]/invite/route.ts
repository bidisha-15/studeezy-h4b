import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params

    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return new NextResponse('Not a member of this group', { status: 403 });
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { inviteCode: true },
    });

    if (!group) {
      return new NextResponse('Group not found', { status: 404 });
    }

    if (!group.inviteCode) {
      return new NextResponse('No invite code available', { status: 404 });
    }

    return NextResponse.json({ inviteCode: group.inviteCode });
  } catch (error) {
    console.error('Error fetching invite code:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
