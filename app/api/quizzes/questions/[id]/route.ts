import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "quizId is required" }, { status: 400 });
  }

  const questions = await prisma.quizQuestion.findMany({
    where: { quizId:id },
  });

  return NextResponse.json(questions);
}
