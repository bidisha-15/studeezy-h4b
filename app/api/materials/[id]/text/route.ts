import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET processed text for a material
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params

  try {
    const material = await prisma.material.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        processedText: true,
        userId: true,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    if (material.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: material.id,
      title: material.title,
      processedText: material.processedText || "",
    });
  } catch (err) {
    console.error("Error fetching material text:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update processed text for a material
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params
  const body = await req.json();
  const { processedText } = body;

  if (!processedText) {
    return NextResponse.json({ error: "Processed text is required" }, { status: 400 });
  }

  try {
    const material = await prisma.material.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    if (material.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        processedText,
      },
      select: {
        id: true,
        title: true,
        processedText: true,
      },
    });

    return NextResponse.json(updatedMaterial);
  } catch (err) {
    console.error("Error updating material text:", err);
    return NextResponse.json({ error: "Failed to update text" }, { status: 500 });
  }
}
