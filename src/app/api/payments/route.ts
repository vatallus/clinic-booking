import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Lấy danh sách thanh toán
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get('appointmentId');
    const status = searchParams.get('status');

    let where: any = {};

    // Nếu là bệnh nhân, chỉ xem được thanh toán của mình
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'PATIENT') {
      where.appointment = {
        patientId: session.user.id
      };
    }

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
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

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Tạo thanh toán mới
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      appointmentId,
      amount,
      method,
      description
    } = body;

    // Kiểm tra appointment có tồn tại không
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền (chỉ bệnh nhân của appointment hoặc admin mới có thể tạo thanh toán)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'PATIENT' && appointment.patientId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only create payments for your own appointments' },
        { status: 403 }
      );
    }

    // Kiểm tra xem đã có thanh toán cho appointment này chưa
    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already exists for this appointment' },
        { status: 409 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amount,
        method,
        status: method === 'CASH' ? 'UNPAID' : 'PENDING',
        description
      },
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            patient: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// PATCH - Cập nhật trạng thái thanh toán
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Chỉ admin hoặc staff mới có thể cập nhật trạng thái thanh toán
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Only admins or doctors can update payment status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { paymentId, status, transactionId } = body;

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        paidAt: status === 'PAID' ? new Date() : null
      },
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            patient: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

