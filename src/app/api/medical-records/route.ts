import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Lấy danh sách hồ sơ bệnh án
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');

    let where: any = {};

    // Nếu là bệnh nhân, chỉ xem được hồ sơ của mình
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'PATIENT') {
      where.patientId = session.user.id;
    } else if (patientId) {
      where.patientId = patientId;
    }

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const records = await prisma.medicalRecord.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

// POST - Tạo hồ sơ bệnh án mới
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Chỉ bác sĩ mới có thể tạo hồ sơ bệnh án
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'DOCTOR' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only doctors can create medical records' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      appointmentId,
      patientId,
      recordType,
      chiefComplaint,
      presentIllness,
      pastHistory,
      examination,
      diagnosis,
      treatment,
      content,
      attachments
    } = body;

    // Kiểm tra appointment có tồn tại không
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const record = await prisma.medicalRecord.create({
      data: {
        appointmentId,
        patientId,
        recordType,
        chiefComplaint,
        presentIllness,
        pastHistory,
        examination,
        diagnosis,
        treatment,
        content,
        attachments: attachments || []
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true
          }
        }
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}

