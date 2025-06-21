import { NextResponse } from 'next/server';
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

    const { id } = params

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

    // Get detailed group information
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        materials: {
          include: {
            material: {
              include: {
                subject: true,
                materialTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
          orderBy: {
            material: {
              uploadedAt: 'desc',
            },
          },
        },
      },
    });

    if (!group) {
      return new NextResponse('Group not found', { status: 404 });
    }

    // Add current user ID to the response for frontend use
    const response = {
      ...group,
      currentUserId: session.user.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching group details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params

    // Check if user is the creator of the group
    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!group) {
      return new NextResponse('Group not found', { status: 404 });
    }

    if (group.createdById !== session.user.id) {
      return new NextResponse('Only the group creator can delete the group', { status: 403 });
    }

    // Delete the group (cascade will handle related records)
    await prisma.studyGroup.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 