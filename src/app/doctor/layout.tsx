import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeSwitcher />
      {children}
    </>
  );
} 