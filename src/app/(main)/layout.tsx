import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Sidebar />
      <main className="pb-12 lg:pb-0 lg:pl-52">
        <div className="mx-auto max-w-xl px-3 py-3">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
