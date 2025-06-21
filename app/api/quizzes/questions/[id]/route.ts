import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {

  const { id } = params;

  const questions = await prisma.QuizQuestion.findMany({
    where: { quizId:id },
  });

  return NextResponse.json(questions);
}
