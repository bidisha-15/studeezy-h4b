import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(context: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = context.params

    try {
        const materials = await prisma.material.findMany({
            where: {
                materialTags: {
                    some: {
                        tagId: id
                    }
                }
            },
            include: {
                subject: true,
                materialTags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error('Error fetching materials by tag:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(context: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id } = context.params
    try {
        await prisma.tag.delete({
            where: {
                id
            }
        });
        return NextResponse.json({ msg: "Tag deleted" }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete tag:", error);
        return NextResponse.json({ msg: "Failed to delete tag" }, { status: 500 });
    }
}