import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function AdminLayout({
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