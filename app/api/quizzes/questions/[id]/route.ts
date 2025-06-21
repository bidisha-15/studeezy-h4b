import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request: Request, context: { params: { id: string } }) {

  const { id } = context.params

  const questions = await prisma.quizQuestion.findMany({
    where: { quizId:id },
  });

  return NextResponse.json(questions);
}