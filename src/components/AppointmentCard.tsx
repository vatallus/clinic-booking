'use client';

import { useTheme } from './ThemeProvider';

interface AppointmentCardProps {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  actionLabel: string;
  onAction: () => void;
}

export function AppointmentCard({
  patientName,
  doctorName,
  date,
  time,
  status,
  actionLabel,
  onAction,
}: AppointmentCardProps) {
  const { colors } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div 
      className="rounded-xl p-6 shadow-lg transition-transform hover:scale-105"
      style={{
        backgroundColor: colors.background,
        border: `1px solid ${colors.primary}20`,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            {patientName}
          </h3>
          <p className="text-sm text-gray-500">with Dr. {doctorName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span style={{ color: colors.text }}>{date}</span>
        </div>
        <div className="flex items-center">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span style={{ color: colors.text }}>{time}</span>
        </div>
      </div>

      <button
        onClick={onAction}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
        style={{
          backgroundColor: colors.primary,
          color: 'white',
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
} 