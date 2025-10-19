'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface MedicalRecord {
  id: string;
  recordType: string;
  chiefComplaint?: string;
  diagnosis?: string;
  createdAt: string;
  appointment: {
    date: string;
    doctor: {
      name: string;
      specialty?: string;
    };
  };
}

interface MedicalRecordListProps {
  patientId?: string;
}

export default function MedicalRecordList({ patientId }: MedicalRecordListProps) {
  const t = useTranslations();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      let url = '/api/medical-records';
      if (patientId) {
        url += `?patientId=${patientId}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
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
      <h2 className="text-2xl font-bold">{t('medicalRecord.title')}</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('medicalRecord.recordType')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('appointment.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('user.doctor')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('medicalRecord.diagnosis')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.recordType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(record.appointment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{record.appointment.doctor.name}</div>
                      {record.appointment.doctor.specialty && (
                        <div className="text-sm text-gray-500">{record.appointment.doctor.specialty}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">{record.diagnosis}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <a
                      href={`/medical-records/${record.id}`}
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

