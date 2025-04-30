import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-8">
      <ThemeSwitcher />
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
} 