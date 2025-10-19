'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DoctorScheduleManager from '@/components/doctor/DoctorScheduleManager';

export default function DoctorSchedulesPage() {
  const t = useTranslations();
  const [doctorId, setDoctorId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setDoctorId(data.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DoctorScheduleManager doctorId={doctorId} />
    </div>
  );
}

