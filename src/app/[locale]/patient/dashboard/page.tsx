'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AppointmentList from '@/components/common/AppointmentList';

export default function PatientDashboard({ params }: { params: { locale: string } }) {
  const t = useTranslations();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    prescriptions: 0,
    unpaidPayments: 0
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

        const appointmentsResponse = await fetch(`/api/appointments?patientId=${userData.id}`);
        if (appointmentsResponse.ok) {
          const appointments = await appointmentsResponse.json();
          
          const upcoming = appointments.filter((a: any) => 
            ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.date) >= new Date()
          ).length;

          const completed = appointments.filter((a: any) => a.status === 'COMPLETED').length;

          setStats({
            upcomingAppointments: upcoming,
            completedAppointments: completed,
            prescriptions: 0,
            unpaidPayments: 0
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
    <DashboardLayout role="PATIENT" locale={params.locale}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.overview')}</h1>

        {loading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.upcomingAppointments')}</div>
                <div className="text-3xl font-bold mt-2">{stats.upcomingAppointments}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('appointment.completed')}</div>
                <div className="text-3xl font-bold mt-2">{stats.completedAppointments}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('nav.prescriptions')}</div>
                <div className="text-3xl font-bold mt-2">{stats.prescriptions}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('payment.unpaid')}</div>
                <div className="text-3xl font-bold mt-2">{stats.unpaidPayments}</div>
              </div>
            </div>

            <AppointmentList role="PATIENT" userId={userId} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

