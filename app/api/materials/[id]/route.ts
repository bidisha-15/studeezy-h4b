import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        subject: true,
        materialTags: { include: { tag: true } },
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (err) {
    console.error('Error fetching material:', err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { subjectId, tagIds } = body;

  try {
    const updatedMaterial = await prisma.material.update({
      where: { id: (await params).id },
      data: {
        subjectId,
        materialTags: {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        materialTags: { include: { tag: true } },
      },
    });

    return NextResponse.json(updatedMaterial);
  } catch (err) {
    console.error("Failed to update material:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE material
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.material.delete({
      where: { id: (await params).id },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Failed to delete material:", err);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
