'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  patient?: {
    id: string;
    name: string;
    phone?: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialty?: string;
  };
  symptoms?: string;
  diagnosis?: string;
}

interface AppointmentListProps {
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  userId?: string;
}

export default function AppointmentList({ role, userId }: AppointmentListProps) {
  const t = useTranslations();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      let url = '/api/appointments';
      if (role === 'DOCTOR' && userId) {
        url += `?doctorId=${userId}`;
      } else if (role === 'PATIENT' && userId) {
        url += `?patientId=${userId}`;
      }
      
      if (filter !== 'all') {
        url += `${url.includes('?') ? '&' : '?'}status=${filter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('appointment.title')}</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">Tất cả</option>
          <option value="PENDING">{t('appointment.pending')}</option>
          <option value="CONFIRMED">{t('appointment.confirmed')}</option>
          <option value="COMPLETED">{t('appointment.completed')}</option>
          <option value="CANCELLED">{t('appointment.cancelled')}</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('appointment.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('appointment.time')}
              </th>
              {role !== 'PATIENT' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('user.patient')}
                </th>
              )}
              {role !== 'DOCTOR' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('user.doctor')}
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('appointment.status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(appointment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.time}
                  </td>
                  {role !== 'PATIENT' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{appointment.patient?.name}</div>
                        {appointment.patient?.phone && (
                          <div className="text-sm text-gray-500">{appointment.patient.phone}</div>
                        )}
                      </div>
                    </td>
                  )}
                  {role !== 'DOCTOR' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{appointment.doctor?.name}</div>
                        {appointment.doctor?.specialty && (
                          <div className="text-sm text-gray-500">{appointment.doctor.specialty}</div>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {t(`appointment.${appointment.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <a
                      href={`/appointments/${appointment.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('common.view')}
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

