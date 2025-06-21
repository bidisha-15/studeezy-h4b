import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const groups = await prisma.studyGroup.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              },
            },
          },
        },
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching study groups:', error);
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
    const { name, description, materialIds } = body;

    if (!name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Generate a unique 6-character invite code
    function generateInviteCode() {
      return crypto.randomBytes(3).toString('hex').toUpperCase();
    }
    const inviteCode = generateInviteCode();
    // Ensure uniqueness (in production, check DB for collisions)

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        inviteCode,
        createdBy: {
          connect: {
            id: session.user.id,
          },
        },
        members: {
          create: {
            role: 'ADMIN',
            user: {
              connect: {
                id: session.user.id,
              },
            },
          },
        },
        materials: {
          create: materialIds?.map((materialId: string) => ({
            material: {
              connect: {
                id: materialId,
              },
            },
          })) || [],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating study group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}