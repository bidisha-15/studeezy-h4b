import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const {id } = params
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    if (!group) return new NextResponse('Group not found', { status: 404 });
    return NextResponse.json(group.members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest,context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const {id } = params
    const { userId } = await req.json();
    if (!userId) return new NextResponse('Missing userId', { status: 400 });
    // Check if current user is admin
    
    const member = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: session.user.id, role: 'ADMIN' },
    });
    if (!member) return new NextResponse('Only admin can add members', { status: 403 });
    // Add user
    await prisma.groupMember.create({
      data: {
        groupId: id,
        userId,
        role: 'MEMBER',
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 