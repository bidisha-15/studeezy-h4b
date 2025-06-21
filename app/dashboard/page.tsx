"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  Brain,
  TrendingUp,
  Plus,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Material {
  id: string;
  title: string;
  fileName: string;
  subject: {
    name: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
}

interface Analytics {
  studyTimeBySubject: {
    subject: string;
    hours: number;
  }[];
}

interface StudyGroup {
  id: string;
  name: string;
  members: {
    id: string;
  }[];
}

interface Quiz {
  id: string;
  score: number;
}

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const name = session.data?.user?.name;
  const recentMaterials = materials.slice(0, 3);
  const totalStudyTime = analytics?.studyTimeBySubject.reduce(
    (acc: number, item) => acc + item.hours,
    0
  ) || 0;
  const weeklyGoal = 40;
  const progress = (totalStudyTime / weeklyGoal) * 100;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, analyticsRes, groupsRes, quizzesRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/analytics'),
        fetch('/api/groups'),
        fetch('/api/quizzes')
      ]);

      if (!materialsRes.ok || !analyticsRes.ok || !groupsRes.ok || !quizzesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [materialsData, analyticsData, groupsData, quizzesData] = await Promise.all([
        materialsRes.json(),
        analyticsRes.json(),
        groupsRes.json(),
        quizzesRes.json()
      ]);

      //dashboard UI compatibility
      const patchedMaterials = materialsData.map((material: any) => ({
        ...material,
        tags: Array.isArray(material.materialTags)
          ? material.materialTags.map((mt: any) => mt.tag)
          : [],
      }));

      setMaterials(patchedMaterials);
      setAnalytics(analyticsData);
      setStudyGroups(groupsData);
      setQuizzes(quizzesData);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const averageQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {name}</h1>
        <p className="text-blue-100">
          Ready to continue your learning journey? Let's make today productive!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              {studyGroups.reduce((sum, group) => sum + group.members.length, 0)} total members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
            <p className="text-xs text-muted-foreground">{averageQuizScore}% avg score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudyTime}h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Materials</CardTitle>
              <CardDescription>
                Your latest uploaded study materials
              </CardDescription>
            </div>
            <Link href="/dashboard/materials">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMaterials.map((material) => (
              <div
                key={material.id}
                className="flex items-center space-x-4 p-3 rounded-lg border"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{material.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {material.subject.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {material.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Link href="/dashboard/materials">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Upload New Material
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Study Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Study Goal</CardTitle>
            <CardDescription>Track your study time progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {totalStudyTime}h / {weeklyGoal}h
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Study Time by Subject</h4>
              {analytics?.studyTimeBySubject.slice(0, 3).map((item) => (
                <div
                  key={item.subject}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{item.subject}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${
                            (item.hours /
                              Math.max(
                                ...analytics.studyTimeBySubject.map(
                                  (s) => s.hours
                                )
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.hours}h</span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/materials">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              >
                <BookOpen className="h-6 w-6" />
                <span>Upload Material</span>
              </Button>
            </Link>

            <Link href="/dashboard/groups">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Users className="h-6 w-6" />
                <span>Join Study Group</span>
              </Button>
            </Link>

            <Link href="/dashboard/quizzes">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Brain className="h-6 w-6" />
                <span>Take Quiz</span>
              </Button>
            </Link>

            <Link href="/dashboard/planner">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Clock className="h-6 w-6" />
                <span>Plan Study</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
