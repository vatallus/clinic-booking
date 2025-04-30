'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface Doctor {
  name: string
  specialty: string
}

interface Appointment {
  id: string
  doctorId: string
  date: string
  time: string
  status: string
  symptoms: string | null
  doctor: Doctor
}

export default function PatientDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole === 'PATIENT') {
      fetchAppointments()
    }
  }, [userRole])

  const checkUserRole = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/login')
        return
      }

      const { data: userData, error: roleError } = await supabase
        .from('User')
        .select('role')
        .eq('id', user.id)
        .single()

      if (roleError || !userData) {
        throw new Error('Failed to get user role')
      }

      if (userData.role !== 'PATIENT') {
        router.push('/login')
        return
      }

      setUserRole(userData.role)
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/login')
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('Appointment')
        .select(`
          id,
          doctorId,
          date,
          time,
          status,
          symptoms,
          doctor:User!Appointment_doctorId_fkey (
            name,
            specialty
          )
        `)
        .eq('patientId', user?.id)
        .order('date', { ascending: true })

      if (error) {
        throw new Error('Failed to fetch appointments')
      }

      const transformedData: Appointment[] = data?.map(appointment => {
        // Get the first doctor from the array if it exists
        const doctorData = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
        
        return {
          ...appointment,
          doctor: {
            name: doctorData?.name || 'Unknown',
            specialty: doctorData?.specialty || 'Unknown'
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

  if (userRole !== 'PATIENT') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link 
          href="/book-appointment"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Book an Appointment</h2>
          <p className="text-gray-600">
            Schedule a new appointment with one of our doctors.
          </p>
        </Link>

        <Link
          href="/my-appointments"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">My Appointments</h2>
          <p className="text-gray-600">
            View and manage your existing appointments.
          </p>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No appointments scheduled.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symptoms
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.doctor.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.doctor.specialty}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {appointment.symptoms || 'No symptoms provided'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 