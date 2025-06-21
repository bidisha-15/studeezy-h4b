import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const user = await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      email: true,
      name: true,
      university: true,
      createdAt: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}