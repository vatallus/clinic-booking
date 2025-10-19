'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import MedicalRecordList from '@/components/medical-record/MedicalRecordList';

export default function PatientMedicalRecordsPage({ params }: { params: { locale: string } }) {
  return (
    <DashboardLayout role="PATIENT" locale={params.locale}>
      <MedicalRecordList />
    </DashboardLayout>
  );
}

