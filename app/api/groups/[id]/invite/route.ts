import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    // Get the group with invite code
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

// POST /api/groups/join - join a group by invite code
export async function POST(req: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { code } = await req.json();
    if (!code) return new NextResponse('Missing code', { status: 400 });
    const group = await prisma.studyGroup.findUnique({ where: { inviteCode: code } as any });
    if (!group) return new NextResponse('Invalid code', { status: 404 });
    // Check if already a member
    const existing = await prisma.groupMember.findFirst({
      where: { groupId: group.id, userId: session.user.id },
    });
    if (existing) return new NextResponse('Already a member', { status: 400 });
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'MEMBER',
      },
    });
    return NextResponse.json({ success: true, groupId: group.id });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
