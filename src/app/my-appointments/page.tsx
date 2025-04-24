'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Doctor {
  name: string
  specialty: string
}

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  symptoms: string
  doctorId: string
  Doctor: Doctor
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting user:', userError)
        throw new Error('Unauthorized')
      }

      // Fetch appointments with doctor details
      const { data, error } = await supabase
        .from('Appointment')
        .select(`
          id,
          date,
          time,
          status,
          symptoms,
          doctorId,
          Doctor (
            name,
            specialty
          )
        `)
        .eq('patientId', user.id)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
        throw new Error('Failed to fetch appointments')
      }

      console.log('Raw appointments data:', data)
      // Transform the data to match our interface
      const transformedData = data?.map(appointment => {
        const doctorData = appointment.Doctor as unknown as { name: string; specialty: string }
        return {
          id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          symptoms: appointment.symptoms,
          doctorId: appointment.doctorId,
          Doctor: {
            name: doctorData?.name || 'Unknown Doctor',
            specialty: doctorData?.specialty || 'Unknown Specialty'
          }
        }
      }) || []
      setAppointments(transformedData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <div className="flex gap-4">
          <Link
            href="/book-appointment"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Book New Appointment
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <p className="text-center text-gray-600">No appointments found.</p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-semibold">
                    Dr. {appointment.Doctor?.name || 'Unknown Doctor'}
                  </h2>
                  <p className="text-gray-600">{appointment.Doctor?.specialty || 'Unknown Specialty'}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              <div className="text-gray-600">
                <p>Date: {formatDate(appointment.date)}</p>
                <p>Time: {appointment.time}</p>
                {appointment.symptoms && (
                  <p className="mt-2">
                    <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 