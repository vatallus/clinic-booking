'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface MedicalRecordFormProps {
  appointmentId: string;
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MedicalRecordForm({
  appointmentId,
  patientId,
  onSuccess,
  onCancel,
}: MedicalRecordFormProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recordType: '15/BV1', // Bệnh án Ngoại trú chung
    chiefComplaint: '',
    presentIllness: '',
    pastHistory: '',
    examination: '',
    diagnosis: '',
    treatment: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          patientId,
          ...formData,
        }),
      });

      if (response.ok) {
        alert(t('messages.recordCreated'));
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || t('common.error'));
      }
    } catch (error) {
      console.error('Error creating medical record:', error);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold">{t('medicalRecord.createRecord')}</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.recordType')}
        </label>
        <select
          value={formData.recordType}
          onChange={(e) => handleChange('recordType', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="15/BV1">Bệnh án Ngoại trú chung (15/BV1)</option>
          <option value="01/BV1">Bệnh án Nội khoa (01/BV1)</option>
          <option value="02/BV1">Bệnh án Nhi khoa (02/BV1)</option>
          <option value="10/BV1">Bệnh án Ngoại khoa (10/BV1)</option>
          <option value="14/BV1">Bệnh án Tai Mũi Họng (14/BV1)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.chiefComplaint')}
        </label>
        <textarea
          value={formData.chiefComplaint}
          onChange={(e) => handleChange('chiefComplaint', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          placeholder="Lý do khám bệnh..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.presentIllness')}
        </label>
        <textarea
          value={formData.presentIllness}
          onChange={(e) => handleChange('presentIllness', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={4}
          placeholder="Quá trình bệnh lý..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.pastHistory')}
        </label>
        <textarea
          value={formData.pastHistory}
          onChange={(e) => handleChange('pastHistory', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          placeholder="Tiền sử bệnh..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.examination')}
        </label>
        <textarea
          value={formData.examination}
          onChange={(e) => handleChange('examination', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={4}
          placeholder="Kết quả khám bệnh..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.diagnosis')}
        </label>
        <textarea
          value={formData.diagnosis}
          onChange={(e) => handleChange('diagnosis', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={2}
          placeholder="Chẩn đoán..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('medicalRecord.treatment')}
        </label>
        <textarea
          value={formData.treatment}
          onChange={(e) => handleChange('treatment', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          placeholder="Phương pháp điều trị..."
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? t('common.loading') : t('common.save')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}

