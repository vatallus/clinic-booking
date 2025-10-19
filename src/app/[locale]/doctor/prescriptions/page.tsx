'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PrescriptionList from '@/components/prescription/PrescriptionList';

export default function DoctorPrescriptionsPage({ params }: { params: { locale: string } }) {
  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setDoctorId(data.id);
      }
    };
    fetchUser();
  }, []);

  return (
    <DashboardLayout role="DOCTOR" locale={params.locale}>
      <PrescriptionList doctorId={doctorId} />
    </DashboardLayout>
  );
}

