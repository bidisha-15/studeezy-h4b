import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma'; // Comment out since we are using dummy data

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Using dummy data as requested, because of database issues.
    const dummyManualPlans = [
      {
        id: 'manual-plan-1',
        title: 'Mid-Term Exam Prep',
        date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        userId: session.user.id,
        linkedMaterials: [
          {
            material: {
              id: 'material-1',
              title: 'Introduction to Algorithms',
              fileType: 'pdf',
              subject: { name: 'Computer Science' }
            }
          },
          {
            material: {
              id: 'material-2',
              title: 'Data Structures Notes',
              fileType: 'pdf',
              subject: { name: 'Computer Science' }
            }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'manual-plan-2',
        title: 'Calculus Final Review',
        date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
        userId: session.user.id,
        linkedMaterials: [
          {
            material: {
              id: 'material-3',
              title: 'Derivatives Cheat Sheet',
              fileType: 'png',
              subject: { name: 'Mathematics' }
            }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(dummyManualPlans);
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
  
      const body = await request.json();
      console.log("Received data for new plan:", body);
      
      // Since we are not connected to a DB, we just simulate a successful creation
      const newPlan = {
        id: `manual-plan-${Math.floor(Math.random() * 1000)}`,
        ...body,
        date: new Date(body.date).toISOString(),
        userId: session.user.id,
        linkedMaterials: body.materialIds.map((id: string) => ({
            material: {
                id,
                title: `Material ${id}`,
                fileType: 'pdf',
                subject: { name: 'Sample Subject'}
            }
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      return NextResponse.json(newPlan, { status: 201 });
    } catch (error) {
      console.error('Error creating study plan:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  } 