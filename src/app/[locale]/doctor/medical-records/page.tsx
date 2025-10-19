'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import MedicalRecordList from '@/components/medical-record/MedicalRecordList';

export default function DoctorMedicalRecordsPage({ params }: { params: { locale: string } }) {
  return (
    <DashboardLayout role="DOCTOR" locale={params.locale}>
      <MedicalRecordList />
    </DashboardLayout>
  );
}

