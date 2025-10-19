'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
  appointment: {
    id: string;
    date: string;
    time: string;
    patient: {
      name: string;
    };
    doctor: {
      name: string;
    };
  };
}

interface PaymentListProps {
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
}

export default function PaymentList({ role }: PaymentListProps) {
  const t = useTranslations();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'UNPAID': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
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
      <h2 className="text-2xl font-bold">{t('payment.title')}</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('appointment.date')}
              </th>
              {role !== 'PATIENT' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('user.patient')}
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('payment.amount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('payment.method')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('payment.status')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(payment.appointment.date)}
                  </td>
                  {role !== 'PATIENT' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.appointment.patient.name}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {payment.amount.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t(`payment.${payment.method.toLowerCase()}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                      {t(`payment.${payment.status.toLowerCase()}`)}
                    </span>
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

