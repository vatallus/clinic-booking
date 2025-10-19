'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface MedicineDetail {
  medicineName: string;
  dosage: string;
  quantity: number;
  unit: string;
  instructions: string;
  morning: boolean;
  noon: boolean;
  afternoon: boolean;
  evening: boolean;
  beforeMeal: boolean;
  afterMeal: boolean;
}

interface PrescriptionFormProps {
  appointmentId: string;
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PrescriptionForm({
  appointmentId,
  patientId,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<MedicineDetail[]>([
    {
      medicineName: '',
      dosage: '',
      quantity: 1,
      unit: 'viên',
      instructions: '',
      morning: false,
      noon: false,
      afternoon: false,
      evening: false,
      beforeMeal: false,
      afterMeal: true,
    },
  ]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicineName: '',
        dosage: '',
        quantity: 1,
        unit: 'viên',
        instructions: '',
        morning: false,
        noon: false,
        afternoon: false,
        evening: false,
        beforeMeal: false,
        afterMeal: true,
      },
    ]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineDetail, value: any) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          patientId,
          diagnosis,
          notes,
          details: medicines,
        }),
      });

      if (response.ok) {
        alert(t('messages.prescriptionCreated'));
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || t('common.error'));
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold">{t('prescription.createPrescription')}</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('appointment.diagnosis')}
        </label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={2}
          placeholder="Chẩn đoán..."
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('prescription.medicine')}</h3>
          <button
            type="button"
            onClick={addMedicine}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            + Thêm thuốc
          </button>
        </div>

        {medicines.map((medicine, index) => (
          <div key={index} className="p-4 border rounded space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Thuốc {index + 1}</span>
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">{t('prescription.medicineName')}</label>
                <input
                  type="text"
                  value={medicine.medicineName}
                  onChange={(e) => updateMedicine(index, 'medicineName', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('prescription.dosage')}</label>
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="VD: 500mg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">{t('prescription.quantity')}</label>
                <input
                  type="number"
                  value={medicine.quantity}
                  onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('prescription.unit')}</label>
                <select
                  value={medicine.unit}
                  onChange={(e) => updateMedicine(index, 'unit', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="viên">Viên</option>
                  <option value="gói">Gói</option>
                  <option value="chai">Chai</option>
                  <option value="ống">Ống</option>
                  <option value="hộp">Hộp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Thời gian uống</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medicine.morning}
                    onChange={(e) => updateMedicine(index, 'morning', e.target.checked)}
                    className="mr-2"
                  />
                  {t('prescription.morning')}
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medicine.noon}
                    onChange={(e) => updateMedicine(index, 'noon', e.target.checked)}
                    className="mr-2"
                  />
                  {t('prescription.noon')}
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medicine.afternoon}
                    onChange={(e) => updateMedicine(index, 'afternoon', e.target.checked)}
                    className="mr-2"
                  />
                  {t('prescription.afternoon')}
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medicine.evening}
                    onChange={(e) => updateMedicine(index, 'evening', e.target.checked)}
                    className="mr-2"
                  />
                  {t('prescription.evening')}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Uống thuốc</label>
              <div className="flex gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medicine.beforeMeal}
                    onChange={(e) => updateMedicine(index, 'beforeMeal', e.target.checked)}
                    className="mr-2"
                  />
                  {t('prescription.beforeMeal')}
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={medicine.afterMeal}
                    onChange={(e) => updateMedicine(index, 'afterMeal', e.target.checked)}
                    className="mr-2"
                  />
                  {t('prescription.afterMeal')}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">{t('prescription.instructions')}</label>
              <textarea
                value={medicine.instructions}
                onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={2}
                placeholder="Hướng dẫn sử dụng..."
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('prescription.notes')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          placeholder="Lời dặn của bác sĩ..."
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

