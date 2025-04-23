import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { supabase } from '@/lib/supabase'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get the current user from Supabase
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch appointments for the current user
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: user.id
      },
      include: {
        doctor: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, date, time, notes } = body

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.id,
        doctorId,
        date: new Date(date),
        time,
        notes,
        status: 'PENDING'
      },
      include: {
        doctor: true
      }
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
} 