import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil - Dinkominfo Kabupaten Pekalongan',
  description:
    'Profil Dinas Komunikasi dan Informatika Kabupaten Pekalongan: visi, misi, tugas pokok, dan struktur organisasi.',
};

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Profil', path: '/profil' }]} />
      {children}
    </>
  );
}
