'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userName: string;
  userRole: string;
  locale: string;
}

export default function Header({ userName, userRole, locale }: HeaderProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push(`/${locale}/login`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchLocale = (newLocale: string) => {
    const path = window.location.pathname;
    const newPath = path.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{t('common.welcome')}, {userName}</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {t(`user.${userRole.toLowerCase()}`)}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => switchLocale('vi')}
              className={`px-3 py-1 rounded ${locale === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              VI
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`px-3 py-1 rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              EN
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </div>
    </header>
  );
}

