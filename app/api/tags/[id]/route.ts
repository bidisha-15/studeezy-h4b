import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        const tag = await prisma.tag.findUnique({
            where: { id },
        });
        if (!tag) {
            return new NextResponse('Tag not found', { status: 404 });
        }
        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error fetching tag:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id } = params;
    try {
        const { name, color } = await req.json();
        const updatedTag = await prisma.tag.update({
            where: { id },
            data: { name, color },
        });
        return NextResponse.json(updatedTag);
    } catch (error) {
        console.error('Error updating tag:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const id = params.id;
    try {
        await prisma.tag.delete({
            where: { id }
        });
        return NextResponse.json({ msg: "Tag deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ msg: "Failed to delete tag" }, { status: 500 });
    }
}