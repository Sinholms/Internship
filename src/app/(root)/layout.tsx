import Providers from '../providers';
import Header from '@/components/Header/Header';
import FooterNext from '@/components/Footer/FooterNext';

export default function RootGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen flex flex-col text-on-surface">
        <Header />
        <main className="flex-1">{children}</main>
        <FooterNext />
      </div>
    </Providers>
  );
}
