import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            insuranceNumber: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            doctor: {
              select: {
                id: true,
                name: true,
                specialty: true
              }
            }
          }
        }
      }
    });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'PATIENT' && record.patientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return NextResponse.json({ error: 'Failed to fetch medical record' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'DOCTOR' && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only doctors can update medical records' }, { status: 403 });
    }

    const body = await request.json();
    const record = await prisma.medicalRecord.update({
      where: { id: params.id },
      data: body,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        appointment: { select: { id: true, date: true, time: true } }
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json({ error: 'Failed to update medical record' }, { status: 500 });
  }
}

