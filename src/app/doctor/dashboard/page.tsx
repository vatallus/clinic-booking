'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { HeroSection } from '@/components/HeroSection'
import { StatsCard } from '@/components/StatsCard'
import { AppointmentCard } from '@/components/AppointmentCard'

interface Patient {
  name: string
  email: string
}

interface Appointment {
  id: string
  patientId: string
  date: string
  time: string
  status: string
  symptoms: string | null
  patient: Patient
}

export default function DoctorDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState('')
  const [filterType, setFilterType] = useState('ALL') // ALL, TODAY, WEEK, MONTH
  const [filterStatus, setFilterStatus] = useState('ALL') // ALL, PENDING, CONFIRMED, CANCELLED, COMPLETED

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole === 'DOCTOR') {
      fetchAppointments()
    }
  }, [userRole, filterType, filterStatus])

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

      if (userData.role !== 'DOCTOR') {
        router.push('/login')
        return
      }

      setUserRole(userData.role)
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/login')
    }
  }

  const getDateRange = () => {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    switch (filterType) {
      case 'TODAY':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'WEEK':
        start.setDate(now.getDate() - now.getDay())
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'MONTH':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        break
      default:
        return null
    }

    return { start, end }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('Appointment')
        .select(`
          id,
          patientId,
          date,
          time,
          status,
          symptoms,
          patient:User!Appointment_patientId_fkey (
            name,
            email
          )
        `)
        .eq('doctorId', user?.id)
        .order('date', { ascending: true })

      // Apply date filter
      const dateRange = getDateRange()
      if (dateRange) {
        query = query
          .gte('date', dateRange.start.toISOString())
          .lte('date', dateRange.end.toISOString())
      }

      // Apply status filter
      if (filterStatus !== 'ALL') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) {
        throw new Error('Failed to fetch appointments')
      }

      const transformedData: Appointment[] = data?.map(appointment => {
        // Get the first patient from the array if it exists
        const patientData = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient
        
        return {
          ...appointment,
          patient: {
            name: patientData?.name || 'Unknown',
            email: patientData?.email || 'Unknown'
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

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('Appointment')
        .update({ status: newStatus })
        .eq('id', appointmentId)

      if (error) {
        throw new Error('Failed to update appointment status')
      }

      // Refresh appointments after update
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment status:', error)
      setError(error instanceof Error ? error.message : 'Failed to update appointment status')
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

  if (userRole !== 'DOCTOR') {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection
        title="Chào mừng Bác sĩ"
        subtitle="Quản lý lịch hẹn và chăm sóc bệnh nhân của bạn một cách hiệu quả"
        imageUrl="/images/doctor-hero.jpg"
        role="doctor"
      />

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="filterType">
            Lọc theo thời gian
          </label>
          <select
            id="filterType"
            className="w-full p-2 border border-gray-300 rounded"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="TODAY">Hôm nay</option>
            <option value="WEEK">Tuần này</option>
            <option value="MONTH">Tháng này</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2" htmlFor="filterStatus">
            Lọc theo trạng thái
          </label>
          <select
            id="filterStatus"
            className="w-full p-2 border border-gray-300 rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard
          title="Lịch hẹn hôm nay"
          value={appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length.toString()}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Bệnh nhân mới"
          value={appointments.filter(a => a.status === 'PENDING').length.toString()}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatsCard
          title="Đánh giá trung bình"
          value="4.8"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        />
      </div>

      {/* Appointments Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Lịch hẹn hôm nay</h2>
        {loading ? (
          <div className="text-center py-8">Đang tải lịch hẹn...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Không có lịch hẹn nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                patientName={appointment.patient.name}
                doctorName="Bạn"
                date={new Date(appointment.date).toLocaleDateString()}
                time={appointment.time}
                status={appointment.status.toLowerCase() as "pending" | "confirmed" | "completed" | "cancelled"}
                actionLabel={
                  appointment.status === 'PENDING' ? 'Xác nhận' :
                  appointment.status === 'CONFIRMED' ? 'Bắt đầu khám' :
                  'Xem chi tiết'
                }
                onAction={() => {
                  if (appointment.status === 'PENDING') {
                    handleStatusUpdate(appointment.id, 'CONFIRMED')
                  } else if (appointment.status === 'CONFIRMED') {
                    handleStatusUpdate(appointment.id, 'COMPLETED')
                  } else {
                    router.push(`/doctor/appointment/${appointment.id}`)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 