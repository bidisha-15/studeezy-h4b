import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  const questions = await prisma.quizQuestion.findMany({
    where: { quizId:id },
  });

  return NextResponse.json(questions);
}