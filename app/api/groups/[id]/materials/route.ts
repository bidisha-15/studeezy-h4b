import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/groups/[id]/materials - list all shared materials in the group
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params

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

    // Get all materials shared in the group
    const groupMaterials = await prisma.groupMaterial.findMany({
      where: { groupId: id },
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
    });

    return NextResponse.json(groupMaterials);
  } catch (error) {
    console.error('Error fetching group materials:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/groups/[id]/materials - share a material with the group
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params
    const body = await request.json();
    const { materialId } = body;

    if (!materialId) {
      return new NextResponse('Material ID is required', { status: 400 });
    }

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

    // Check if the material belongs to the user
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        userId: session.user.id,
      },
    });

    if (!material) {
      return new NextResponse('Material not found or not owned by you', { status: 404 });
    }

    // Check if material is already shared in the group
    const existingShare = await prisma.groupMaterial.findFirst({
      where: {
        groupId: id,
        materialId,
      },
    });

    if (existingShare) {
      return new NextResponse('Material is already shared in this group', { status: 400 });
    }

    // Share the material
    await prisma.groupMaterial.create({
      data: {
        groupId: id,
        materialId,
      },
    });

    return NextResponse.json({ message: 'Material shared successfully' });
  } catch (error) {
    console.error('Error sharing material:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');

    if (!materialId) {
      return new NextResponse('Material ID is required', { status: 400 });
    }

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

    // Check if the material belongs to the user (only owner can unshare)
    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        userId: session.user.id,
      },
    });

    if (!material) {
      return new NextResponse('Material not found or not owned by you', { status: 404 });
    }

    // Remove the material from the group
    await prisma.groupMaterial.deleteMany({
      where: {
        groupId: id,
        materialId,
      },
    });

    return NextResponse.json({ message: 'Material removed from group' });
  } catch (error) {
    console.error('Error removing material from group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 