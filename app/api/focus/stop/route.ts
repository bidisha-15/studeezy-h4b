import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, taskTitle = '' } = body;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 });

  const fs = await prisma.focusSession.findUnique({ where: { id: sessionId } });
  if (!fs) return new NextResponse('Session not found', { status: 404 });

  const endedAt = new Date();
  const duration = Math.floor((endedAt.getTime() - new Date(fs.startedAt).getTime()) / 1000);

  const updated = await prisma.focusSession.update({
    where: { id: sessionId },
    data: { endedAt, duration, taskTitle },
  });

  return NextResponse.json(updated);
}