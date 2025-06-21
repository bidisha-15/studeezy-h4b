import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, color } = await req.json();
    const tag = await prisma.tag.create({
      data: {
        name,
        color
      }
    });
    return NextResponse.json(tag, { status: 200 });
  } catch (error) {
    console.error('Error adding tag:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}