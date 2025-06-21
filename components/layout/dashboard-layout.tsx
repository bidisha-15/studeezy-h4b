import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Navbar />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6  border-orange-500">
        {children}
      </main>
    </div>
  );
}
