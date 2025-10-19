'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SidebarProps {
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  locale: string;
}

export default function Sidebar({ role, locale }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const doctorLinks = [
    { href: `/${locale}/doctor/dashboard`, label: t('nav.dashboard'), icon: '📊' },
    { href: `/${locale}/doctor/appointments`, label: t('nav.appointments'), icon: '📅' },
    { href: `/${locale}/doctor/schedules`, label: t('doctor.schedule'), icon: '🕐' },
    { href: `/${locale}/doctor/patients`, label: t('nav.patients'), icon: '👥' },
    { href: `/${locale}/doctor/medical-records`, label: t('nav.medicalRecords'), icon: '📋' },
    { href: `/${locale}/doctor/prescriptions`, label: t('nav.prescriptions'), icon: '💊' },
  ];

  const patientLinks = [
    { href: `/${locale}/patient/dashboard`, label: t('nav.dashboard'), icon: '📊' },
    { href: `/${locale}/patient/appointments`, label: t('nav.appointments'), icon: '📅' },
    { href: `/${locale}/patient/medical-records`, label: t('nav.medicalRecords'), icon: '📋' },
    { href: `/${locale}/patient/prescriptions`, label: t('nav.prescriptions'), icon: '💊' },
    { href: `/${locale}/patient/payments`, label: t('nav.payments'), icon: '💳' },
  ];

  const adminLinks = [
    { href: `/${locale}/admin/dashboard`, label: t('nav.dashboard'), icon: '📊' },
    { href: `/${locale}/admin/appointments`, label: t('nav.appointments'), icon: '📅' },
    { href: `/${locale}/admin/doctors`, label: t('nav.doctors'), icon: '👨‍⚕️' },
    { href: `/${locale}/admin/patients`, label: t('nav.patients'), icon: '👥' },
    { href: `/${locale}/admin/payments`, label: t('nav.payments'), icon: '💳' },
    { href: `/${locale}/admin/reports`, label: t('nav.reports'), icon: '📈' },
  ];

  const links = role === 'DOCTOR' ? doctorLinks : role === 'PATIENT' ? patientLinks : adminLinks;

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600">{t('common.appName')}</h1>
      </div>
      <nav className="mt-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              isActive(link.href) ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
            }`}
          >
            <span className="mr-3 text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

