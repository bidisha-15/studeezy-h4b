import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request: Request, { params }: { params: { id: string } }) {

  const { id } = params

  const questions = await prisma.quizQuestion.findMany({
    where: { quizId:id },
  });

  return NextResponse.json(questions);
}