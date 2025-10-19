'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Prescription {
  id: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  doctor: {
    name: string;
    specialty?: string;
  };
  appointment: {
    date: string;
  };
  details: Array<{
    medicineName: string;
    dosage: string;
    quantity: number;
  }>;
}

interface PrescriptionListProps {
  patientId?: string;
  doctorId?: string;
}

export default function PrescriptionList({ patientId, doctorId }: PrescriptionListProps) {
  const t = useTranslations();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId, doctorId]);

  const fetchPrescriptions = async () => {
    try {
      let url = '/api/prescriptions';
      const params = [];
      if (patientId) params.push(`patientId=${patientId}`);
      if (doctorId) params.push(`doctorId=${doctorId}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
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
      <h2 className="text-2xl font-bold">{t('prescription.title')}</h2>

      <div className="grid gap-4">
        {prescriptions.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            {t('common.noData')}
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{t('prescription.title')}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(prescription.appointment.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{prescription.doctor.name}</p>
                  {prescription.doctor.specialty && (
                    <p className="text-sm text-gray-600">{prescription.doctor.specialty}</p>
                  )}
                </div>
              </div>

              {prescription.diagnosis && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">{t('appointment.diagnosis')}:</p>
                  <p className="text-sm">{prescription.diagnosis}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('prescription.medicine')}:</p>
                <div className="space-y-2">
                  {prescription.details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{detail.medicineName}</p>
                        <p className="text-sm text-gray-600">{detail.dosage}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">SL: {detail.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {prescription.notes && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium text-gray-700">{t('prescription.notes')}:</p>
                  <p className="text-sm">{prescription.notes}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <a
                  href={`/prescriptions/${prescription.id}`}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  {t('prescription.viewPrescription')}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

