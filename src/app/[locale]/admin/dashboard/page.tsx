'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminDashboard({ params }: { params: { locale: string } }) {
  const t = useTranslations();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const appointmentsResponse = await fetch('/api/appointments');
      const usersResponse = await fetch('/api/users');
      
      if (appointmentsResponse.ok && usersResponse.ok) {
        const appointments = await appointmentsResponse.json();
        const users = await usersResponse.json();

        const doctors = users.filter((u: any) => u.role === 'DOCTOR').length;
        const patients = users.filter((u: any) => u.role === 'PATIENT').length;

        setStats({
          totalAppointments: appointments.length,
          totalDoctors: doctors,
          totalPatients: patients,
          totalRevenue: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" locale={params.locale}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('dashboard.overview')}</h1>

        {loading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('nav.appointments')}</div>
                <div className="text-3xl font-bold mt-2">{stats.totalAppointments}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.totalDoctors')}</div>
                <div className="text-3xl font-bold mt-2">{stats.totalDoctors}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.totalPatients')}</div>
                <div className="text-3xl font-bold mt-2">{stats.totalPatients}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600">{t('dashboard.revenue')}</div>
                <div className="text-3xl font-bold mt-2">{stats.totalRevenue.toLocaleString('vi-VN')} ₫</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">{t('dashboard.statistics')}</h2>
              <div className="text-gray-600">{t('common.noData')}</div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

