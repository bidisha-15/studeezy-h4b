import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return new NextResponse('Invite code is required', { status: 400 });
    }

    // Find the group by invite code
    const group = await prisma.studyGroup.findUnique({
      where: { inviteCode: code.toUpperCase() },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!group) {
      return new NextResponse('Invalid invite code', { status: 404 });
    }

    // Check if user is already a member
    if (group.members.length > 0) {
      return new NextResponse('You are already a member of this group', { status: 400 });
    }

    // Add user to the group
    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: 'MEMBER',
      },
    });

    return NextResponse.json({ 
      message: 'Successfully joined the group',
      groupId: group.id 
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 