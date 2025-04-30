'use client';

import { useTheme } from './ThemeProvider';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function StatsCard({ title, value, icon, trend, onClick }: StatsCardProps) {
  const { colors } = useTheme();

  return (
    <div 
      className="rounded-xl p-6 shadow-lg transition-transform hover:scale-105 cursor-pointer"
      style={{
        backgroundColor: colors.background,
        border: `1px solid ${colors.primary}20`,
      }}
      onClick={onClick}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          {title}
        </h3>
        <div 
          className="rounded-lg p-2"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline justify-between">
        <p 
          className="text-3xl font-bold"
          style={{ color: colors.primary }}
        >
          {value}
        </p>
        
        {trend && (
          <div className="flex items-center">
            <span 
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 