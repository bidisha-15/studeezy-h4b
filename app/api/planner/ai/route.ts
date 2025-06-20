import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geminiGenerateStudyPlan } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { subjectId, materialIds, timeFrame } = await req.json();
    if (!subjectId || !materialIds || !Array.isArray(materialIds) || !timeFrame) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) return new NextResponse('Subject not found', { status: 404 });
    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { id: true, title: true, processedText: true }
    });
    if (materials.length === 0) return new NextResponse('No materials found', { status: 404 });

    const materialTexts = materials.map(m => ({ id: m.id, title: m.title, text: m.processedText || '' }));
    const aiPlan = await geminiGenerateStudyPlan({
      subject: subject.name,
      materials: materialTexts,
      timeFrame
    });
    // Save plan
    const plan = await prisma.aiStudyPlan.create({
        data: {
          userId: session.user.id,
          subjectId,
          timeFrame,
          plan: aiPlan,
          materials: {
            create: materials.map(m => ({ material: { connect: { id: m.id } } }))
          }
        },
        include: { materials: { include: { material: true } } }
      });
    return NextResponse.json(plan);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 