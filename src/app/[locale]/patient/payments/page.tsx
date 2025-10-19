'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PaymentList from '@/components/common/PaymentList';

export default function PatientPaymentsPage({ params }: { params: { locale: string } }) {
  return (
    <DashboardLayout role="PATIENT" locale={params.locale}>
      <PaymentList role="PATIENT" />
    </DashboardLayout>
  );
}

