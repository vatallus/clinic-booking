export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  brown?: string;
}

export type ThemeType = 'admin' | 'doctor' | 'patient';

export const themes: Record<ThemeType, ThemeColors> = {
  admin: {
    primary: '#4F46E5', // Indigo
    secondary: '#818CF8',
    background: '#E0E7FF', // Brighter Indigo
    text: '#1F2937',
    accent: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  doctor: {
    primary: '#0EA5E9', // Sky Blue
    secondary: '#38BDF8',
    background: '#BAE6FD', // Brighter Sky Blue
    text: '#0F172A',
    accent: '#7DD3FC',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  patient: {
    primary: '#EC4899', // Pink
    secondary: '#F472B6',
    background: '#FBCFE8', // Brighter Pink
    text: '#1F2937',
    accent: '#F9A8D4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    brown: '#B45309', // Brown
  },
}; 