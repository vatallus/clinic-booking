'use client';

import { useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';

export function ThemeSwitcher() {
  const { setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setTheme('admin');
    } else if (pathname.startsWith('/doctor')) {
      setTheme('doctor');
    } else {
      setTheme('patient');
    }
  }, [pathname, setTheme]);

  return null;
} 