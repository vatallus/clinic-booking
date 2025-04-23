import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { supabase } from '@/lib/supabase'

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Verify the appointment belongs to the current user
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        patientId: user.id
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: params.id
      },
      data: {
        status
      },
      include: {
        doctor: true
      }
    })

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
} 