// pi/subjects/:id	PUT	Edit subject
// /api/subjects/:id	DELETE	Delete subject

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function DELETE(
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params

    const subject = await prisma.subject.findUnique({
      where: {
        id: id,
      },
    });

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 });
    }

    if (subject.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.subject.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
