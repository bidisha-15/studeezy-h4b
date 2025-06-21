"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Brain, 
  CreditCard, 
  BarChart3, 
  Calendar, 
  GraduationCap, 
  Tags,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalMaterials: number;
  totalSubjects: number;
  totalFlashcards: number;
  totalQuizzes: number;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
  studyProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Upload Material',
      description: 'Add new study materials',
      icon: BookOpen,
      href: '/dashboard/materials',
      color: 'bg-blue-500',
    },
    {
      title: 'Create Group',
      description: 'Start a study group',
      icon: Users,
      href: '/dashboard/groups',
      color: 'bg-green-500',
    },
    {
      title: 'Generate Quiz',
      description: 'Create practice questions',
      icon: Brain,
      href: '/dashboard/quizzes',
      color: 'bg-purple-500',
    },
    {
      title: 'Study Flashcards',
      description: 'Review your cards',
      icon: CreditCard,
      href: '/dashboard/flashcards',
      color: 'bg-orange-500',
    },
  ];

  const navigationItems = [
    { name: 'Materials', href: '/dashboard/materials', icon: BookOpen, description: 'Manage your study materials' },
    { name: 'Study Groups', href: '/dashboard/groups', icon: Users, description: 'Collaborate with other students' },
    { name: 'Quizzes', href: '/dashboard/quizzes', icon: Brain, description: 'Test your knowledge' },
    { name: 'Flashcards', href: '/dashboard/flashcards', icon: CreditCard, description: 'Review with flashcards' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Track your progress' },
    { name: 'Planner', href: '/dashboard/planner', icon: Calendar, description: 'Plan your study sessions' },
    { name: 'Subjects', href: '/dashboard/subjects', icon: GraduationCap, description: 'Organize by subjects' },
    { name: 'Tags', href: '/dashboard/tags', icon: Tags, description: 'Categorize your content' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your studies today.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
              <Button asChild size="sm" className="w-full">
                <Link href={action.href}>Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMaterials}</div>
              <p className="text-xs text-muted-foreground">
                Study materials uploaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">
                Active subjects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
              <p className="text-xs text-muted-foreground">
                Cards created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Practice tests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Study Progress */}
      {stats && stats.studyProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Progress
            </CardTitle>
            <CardDescription>
              Your overall study completion rate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-muted-foreground">
                {stats.studyProgress.completed} of {stats.studyProgress.total} completed
              </span>
            </div>
            <Progress value={stats.studyProgress.percentage} className="w-full" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{stats.studyProgress.percentage}% complete</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {navigationItems.map((item) => (
          <Card key={item.name} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={item.href}>Open {item.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      {stats && stats.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest study activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{activity.type}</Badge>
                    <span className="text-sm font-medium">{activity.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
