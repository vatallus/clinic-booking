'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface DoctorScheduleManagerProps {
  doctorId: string;
}

const DAYS_OF_WEEK = [
  { value: 1, labelKey: 'doctor.monday' },
  { value: 2, labelKey: 'doctor.tuesday' },
  { value: 3, labelKey: 'doctor.wednesday' },
  { value: 4, labelKey: 'doctor.thursday' },
  { value: 5, labelKey: 'doctor.friday' },
  { value: 6, labelKey: 'doctor.saturday' },
  { value: 0, labelKey: 'doctor.sunday' },
];

export default function DoctorScheduleManager({ doctorId }: DoctorScheduleManagerProps) {
  const t = useTranslations();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '17:00',
  });

  useEffect(() => {
    fetchSchedules();
  }, [doctorId]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/doctor-schedules?doctorId=${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/doctor-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchSchedules();
        setShowForm(false);
        setFormData({
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '17:00',
        });
      } else {
        const error = await response.json();
        alert(error.error || t('common.error'));
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert(t('common.error'));
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm(t('common.confirm'))) return;

    try {
      const response = await fetch(`/api/doctor-schedules?id=${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSchedules();
      } else {
        alert(t('common.error'));
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert(t('common.error'));
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const day = DAYS_OF_WEEK.find(d => d.value === dayOfWeek);
    return day ? t(day.labelKey) : '';
  };

  if (loading) {
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('doctor.schedule')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? t('common.cancel') : t('common.add')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('appointment.date')}
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
              required
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {t(day.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('doctor.workingHours')} - {t('common.from')}
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('doctor.workingHours')} - {t('common.to')}
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t('common.save')}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('appointment.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('doctor.workingHours')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDayName(schedule.dayOfWeek)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.startTime} - {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
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

