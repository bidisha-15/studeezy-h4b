'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BookOpen, Users, BarChart3, Calendar, Brain, CreditCard, Tags, Home, GraduationCap, Crosshair, Zap } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserNav } from '@/components/UserNav';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Subjects', href: '/dashboard/subjects', icon: GraduationCap },
  { name: 'Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'Focus Sessions', href: '/dashboard/focus-session', icon: Crosshair },
  { name: 'Study Groups', href: '/dashboard/groups', icon: Users },
  { name: 'Quizzes', href: '/dashboard/quizzes', icon: Brain },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Flashcards', href: '/dashboard/flashcards', icon: CreditCard },
  { name: 'Planner', href: '/dashboard/planner', icon: Calendar },
  { name: 'Tags Management', href: '/dashboard/tags', icon: Tags },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          {/* <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg"> */}
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r rounded-lg">
            <img src="/studeezy.png" alt="Studeezy Logo" className="h-8 w-8 dark:invert" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Studeezy
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <nav className="grid gap-2 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="border-r bg-white dark:bg-gray-950 w-full h-full">
          <SidebarContent />
        </div>
      </div>


      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>

            <div className="flex items-center gap-x-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="pt-16">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
