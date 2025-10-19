'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AppointmentList from '@/components/common/AppointmentList';

export default function DoctorDashboard({ params }: { params: { locale: string } }) {
  const t = useTranslations();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    completedAppointments: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userResponse = await fetch('/api/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserId(userData.id);

        const appointmentsResponse = await fetch(`/api/appointments?doctorId=${userData.id}`);
        if (appointmentsResponse.ok) {
          const appointments = await appointmentsResponse.json();
          
          const today = new Date().toDateString();
          const todayAppointments = appointments.filter((a: any) => 
            new Date(a.date).toDateString() === today
          ).length;

          const uniquePatients = new Set(appointments.map((a: any) => a.patientId)).size;
          const completed = appointments.filter((a: any) => a.status === 'COMPLETED').length;

          setStats({
            todayAppointments,
            totalPatients: uniquePatients,
            completedAppointments: completed,
            revenue: 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="DOCTOR" locale={params.locale}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.overview')}</h1>

        {loading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.todayAppointments')}</div>
                <div className="text-3xl font-bold mt-2">{stats.todayAppointments}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.totalPatients')}</div>
                <div className="text-3xl font-bold mt-2">{stats.totalPatients}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('appointment.completed')}</div>
                <div className="text-3xl font-bold mt-2">{stats.completedAppointments}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.revenue')}</div>
                <div className="text-3xl font-bold mt-2">{stats.revenue.toLocaleString('vi-VN')} ₫</div>
              </div>
            </div>

            <AppointmentList role="DOCTOR" userId={userId} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

