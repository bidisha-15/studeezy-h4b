// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const quizId = searchParams.get("quizId");

//   if (!quizId) {
//     return NextResponse.json({ error: "quizId is required" }, { status: 400 });
//   }

//   const questions = await prisma.question.findMany({
//     where: { quizId },
//   });

//   return NextResponse.json(questions);
// }

// import { NextResponse } from "next/server";

// const dummyQuestions = [
//   {
//     id: "q1",
//     quizId: "68561388193b6598ab3913ee",
//     question: "What is 2+2?",
//     options: ["1", "2", "3", "4"],
//     answer: "4",
//   },
//   {
//     id: "68561388193b6598ab3913ee",
//     quizId: "68561388193b6598ab3913ee",
//     question: "What color is the sky?",
//     options: ["Green", "Blue", "Red"],
//     answer: "Blue",
//   },
// ];

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;
//   const questions = dummyQuestions.filter((q) => q.quizId === id);
//   return NextResponse.json(questions);
// }

// app/api/quiz/questions/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "quizId is required" }, { status: 400 });
  }

  const questions = await prisma.QuizQuestion.findMany({
    where: { quizId:id },
  });

  return NextResponse.json(questions);
}
