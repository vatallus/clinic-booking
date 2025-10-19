import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET - Lấy lịch làm việc của bác sĩ
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId,
        isActive: true
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor schedules' },
      { status: 500 }
    );
  }
}

// POST - Tạo lịch làm việc mới
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Chỉ bác sĩ hoặc admin mới có thể tạo lịch làm việc
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'DOCTOR' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only doctors or admins can create schedules' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { doctorId, dayOfWeek, startTime, endTime } = body;

    // Nếu là bác sĩ, chỉ có thể tạo lịch cho chính mình
    if (user?.role === 'DOCTOR' && doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only create schedules for yourself' },
        { status: 403 }
      );
    }

    // Kiểm tra xem lịch đã tồn tại chưa
    const existingSchedule = await prisma.doctorSchedule.findUnique({
      where: {
        doctorId_dayOfWeek_startTime: {
          doctorId,
          dayOfWeek,
          startTime
        }
      }
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule already exists for this time slot' },
        { status: 409 }
      );
    }

    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId,
        dayOfWeek,
        startTime,
        endTime,
        isActive: true
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor schedule' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa lịch làm việc
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Kiểm tra quyền
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Nếu là bác sĩ, chỉ có thể xóa lịch của chính mình
    if (user?.role === 'DOCTOR' && schedule.doctorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own schedules' },
        { status: 403 }
      );
    }

    await prisma.doctorSchedule.delete({
      where: { id: scheduleId }
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor schedule' },
      { status: 500 }
    );
  }
}

