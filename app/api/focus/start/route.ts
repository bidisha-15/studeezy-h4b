import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return new NextResponse('User not found', { status: 404 });

  const sessionRec = await prisma.focusSession.create({
    data: { userId: user.id, startedAt: new Date(), duration:0},
  });

  return NextResponse.json({ id: sessionRec.id, startedAt: sessionRec.startedAt });
}