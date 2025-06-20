'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalyticsChartCard } from '@/components/analytics/analytics-chart-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';
import { toast } from 'sonner';

interface Analytics {
  studyTimeBySubject: { subject: string; hours: number }[];
  quizPerformance: { date: string; score: number }[];
  materialUsage: { material: string; views: number }[];
  weeklyStudyTime: { day: string; hours: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      // Set default empty data structure
      setAnalytics({
        studyTimeBySubject: [],
        quizPerformance: [],
        materialUsage: [],
        weeklyStudyTime: [
          { day: 'Mon', hours: 0 },
          { day: 'Tue', hours: 0 },
          { day: 'Wed', hours: 0 },
          { day: 'Thu', hours: 0 },
          { day: 'Fri', hours: 0 },
          { day: 'Sat', hours: 0 },
          { day: 'Sun', hours: 0 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your study progress and performance
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) return null;

  const totalStudyHours = analytics.studyTimeBySubject.reduce((sum: number, item) => sum + item.hours, 0);
  const averageQuizScore = analytics.quizPerformance.length > 0 
    ? Math.round(analytics.quizPerformance.reduce((sum: number, item) => sum + item.score, 0) / analytics.quizPerformance.length)
    : 0;
  const totalMaterialViews = analytics.materialUsage.reduce((sum: number, item) => sum + item.views, 0);
  const weeklyStudyHours = analytics.weeklyStudyTime.reduce((sum: number, day) => sum + day.hours, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your study progress and performance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudyHours}</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageQuizScore}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.quizPerformance.length > 0 ? `Last ${analytics.quizPerformance.length} quizzes` : 'No quizzes taken'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Material Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMaterialViews}</div>
              <p className="text-xs text-muted-foreground">
                Total document interactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyStudyHours}h</div>
              <p className="text-xs text-muted-foreground">
                Study time logged
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {analytics.studyTimeBySubject.length > 0 && (
            <AnalyticsChartCard
              title="Study Time by Subject"
              data={analytics.studyTimeBySubject.map(item => ({
                name: item.subject,
                value: item.hours
              }))}
              type="pie"
              dataKey="value"
            />
          )}
          
          {analytics.quizPerformance.length > 0 && (
            <AnalyticsChartCard
              title="Quiz Performance Over Time"
              data={analytics.quizPerformance.map(item => ({
                date: item.date,
                score: item.score
              }))}
              type="line"
              dataKey="score"
              xAxisKey="date"
            />
          )}
          
          <AnalyticsChartCard
            title="Weekly Study Hours"
            data={analytics.weeklyStudyTime}
            type="bar"
            dataKey="hours"
            xAxisKey="day"
          />
          
          {analytics.materialUsage.length > 0 && (
            <AnalyticsChartCard
              title="Material Usage"
              data={analytics.materialUsage.map(item => ({
                name: item.material,
                views: item.views
              }))}
              type="bar"
              dataKey="views"
              xAxisKey="name"
            />
          )}
        </div>

        {/* Empty State */}
        {analytics.studyTimeBySubject.length === 0 && 
         analytics.quizPerformance.length === 0 && 
         analytics.materialUsage.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
            <p className="text-muted-foreground">
              Start studying and taking quizzes to see your analytics here.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}