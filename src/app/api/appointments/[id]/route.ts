import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Verify the appointment belongs to the current user
    const { data: appointment, error: fetchError } = await supabase
      .from('Appointment')
      .select('*')
      .eq('id', params.id)
      .eq('patientId', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Update appointment status
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('Appointment')
      .update({
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        doctor:User!Appointment_doctorId_fkey (
          id,
          name,
          specialty,
          description,
          image
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating appointment:', updateError)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
} 