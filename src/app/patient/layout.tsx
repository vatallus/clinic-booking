import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function PatientLayout({
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