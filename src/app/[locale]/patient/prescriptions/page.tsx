'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PrescriptionList from '@/components/prescription/PrescriptionList';

export default function PatientPrescriptionsPage({ params }: { params: { locale: string } }) {
  return (
    <DashboardLayout role="PATIENT" locale={params.locale}>
      <PrescriptionList />
    </DashboardLayout>
  );
}

