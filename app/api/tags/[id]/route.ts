import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    const { id } = params;
    
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