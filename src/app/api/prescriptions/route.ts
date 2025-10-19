import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Lấy danh sách đơn thuốc
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const appointmentId = searchParams.get('appointmentId');

    let where: any = {};

    // Nếu là bệnh nhân, chỉ xem được đơn thuốc của mình
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'PATIENT') {
      where.patientId = session.user.id;
    } else if (user?.role === 'DOCTOR') {
      where.doctorId = session.user.id;
    } else {
      if (patientId) where.patientId = patientId;
      if (doctorId) where.doctorId = doctorId;
    }

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            licenseNumber: true
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true
          }
        },
        details: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

// POST - Tạo đơn thuốc mới
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Chỉ bác sĩ mới có thể tạo đơn thuốc
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'DOCTOR' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only doctors can create prescriptions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      appointmentId,
      patientId,
      diagnosis,
      notes,
      details
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

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        patientId,
        doctorId: session.user.id,
        diagnosis,
        notes,
        details: {
          create: details.map((detail: any) => ({
            medicineName: detail.medicineName,
            dosage: detail.dosage,
            quantity: detail.quantity,
            unit: detail.unit,
            instructions: detail.instructions,
            morning: detail.morning || false,
            noon: detail.noon || false,
            afternoon: detail.afternoon || false,
            evening: detail.evening || false,
            beforeMeal: detail.beforeMeal || false,
            afterMeal: detail.afterMeal || false
          }))
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        },
        details: true
      }
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}

