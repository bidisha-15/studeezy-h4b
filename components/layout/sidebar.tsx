'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Brain,
  CreditCard,
  Tags,
  Home,
  Menu,
  GraduationCap,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Materials', href: '/dashboard/materials', icon: BookOpen },
  { name: 'Study Groups', href: '/dashboard/groups', icon: Users },
  { name: 'Quizzes', href: '/dashboard/quizzes', icon: Brain },
  { name: 'Flashcards', href: '/dashboard/flashcards', icon: CreditCard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Planner', href: '/dashboard/planner', icon: Calendar },
  { name: 'Subjects', href: '/dashboard/subjects', icon: GraduationCap },
  { name: 'Tags', href: '/dashboard/tags', icon: Tags },
];

export function Sidebar() {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6" />
          <span className="">StudyAI</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-2 p-4 lg:px-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary'
                )}
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
    <>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}