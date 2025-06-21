'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  Upload, 
  BookOpen, 
  Users, 
  TrendingUp,
  Star,
  Moon,
  Sun,
  Settings,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Target,
  Zap,
  Award,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  Calendar,
  BarChart3,
  Lightbulb,
  GraduationCap
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
} as const;

const WelcomeSection = ({ user, stats }: { user: any, stats: any }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div 
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {greeting}, {user?.name || 'Student'}! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Ready to continue your learning journey? You have {stats?.upcomingAssignments || 0} new assignments due this week.
        </p>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6"
      >
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Study Streak</p>
                <p className="text-2xl font-bold">{stats?.studyStreak || 0} days</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm">Documents</p>
                <p className="text-2xl font-bold">{stats?.totalDocuments || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Flashcards</p>
                <p className="text-2xl font-bold">{stats?.totalFlashcards || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Points</p>
                <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
              </div>
              <Award className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const QuickActions = () => {
  const router = useRouter();
  
  const actions = [
    {
      icon: Upload,
      title: "Upload Document",
      description: "Add new study materials",
      color: "from-blue-500 to-blue-600",
      action: () => router.push('/dashboard/materials')
    },
    {
      icon: MessageSquare,
      title: "Chat with Documents",
      description: "Ask questions about your materials",
      color: "from-violet-500 to-violet-600",
      action: () => router.push('/dashboard/materials')
    },
    {
      icon: Zap,
      title: "Generate Flashcards",
      description: "Create flashcards from content",
      color: "from-emerald-500 to-emerald-600",
      action: () => router.push('/dashboard/flashcards')
    },
    {
      icon: Users,
      title: "Join Study Group",
      description: "Collaborate with classmates",
      color: "from-pink-500 to-pink-600",
      action: () => router.push('/dashboard/groups')
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "View your learning analytics",
      color: "from-cyan-500 to-cyan-600",
      action: () => router.push('/dashboard/analytics')
    },
    {
      icon: Lightbulb,
      title: "Study Recommendations",
      description: "Get AI-powered suggestions",
      color: "from-yellow-500 to-yellow-600",
      action: () => router.push('/dashboard/planner')
    }
  ];

  return (
    <motion.div 
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        variants={itemVariants}
        className="text-2xl font-semibold text-gray-900 dark:text-white mb-6"
      >
        Quick Actions
      </motion.h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {actions.map((action, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const RecentMaterials = ({ materials }: { materials: any[] }) => {
  const router = useRouter();

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <motion.div 
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Recent Study Materials
        </h2>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/materials')}>
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </motion.div>
      
      <motion.div className="space-y-4" variants={containerVariants}>
        {materials.map((material, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => router.push(`/dashboard/materials/${material.id}`)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900 dark:to-violet-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {material.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {material.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {material.subject?.name || 'General'} • {formatBytes(material.fileSize)} • {getTimeAgo(material.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/materials/${material.id}`); }}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const StudyProgress = ({ weeklyProgress, upcomingDeadlines }: { weeklyProgress: any[], upcomingDeadlines: any[] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Weekly Study Progress</span>
            </CardTitle>
            <CardDescription>
              Your study hours for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-8">
                      {day.day}
                    </span>
                    <div className="flex-1">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(day.hours / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {day.hours}h
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Weekly Goal Progress
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    11
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    63% Complete
                  </p>
                  <Progress value={(weeklyProgress.reduce((sum, day) => sum + day.hours, 0) / 25) * 100} className="w-20 h-2 mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
            <CardDescription>
              Don't miss these important dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      deadline.priority === 'high' ? 'bg-red-500' :
                      deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {deadline.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {deadline.course}
                      </p>
                    </div>
                  </div>
                  <Badge variant={deadline.priority === 'high' ? 'destructive' : 'secondary'}>
                    {deadline.dueDate}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>({
    user: null,
    stats: {
      studyStreak: 0,
      totalDocuments: 0,
      totalFlashcards: 0,
      totalPoints: 0,
      upcomingAssignments: 0
    },
    materials: [],
    weeklyProgress: [
      { day: 'Mon', hours: 0 },
      { day: 'Tue', hours: 0 },
      { day: 'Wed', hours: 0 },
      { day: 'Thu', hours: 0 },
      { day: 'Fri', hours: 0 },
      { day: 'Sat', hours: 0 },
      { day: 'Sun', hours: 0 }
    ],
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const analyticsRes = await fetch('/api/analytics');
        const analytics = await analyticsRes.json();
        console.log("d--analytics", analytics);

        // Fetch materials
        const materialsRes = await fetch('/api/materials');
        const materials = await materialsRes.json();
        console.log("d--materials", materials);

        // Fetch study plans (for upcoming deadlines)
        const plannerRes = await fetch('/api/planner');
        const studyPlans = await plannerRes.json();
        console.log("d--studyPlans", studyPlans);
        console.log("d--studyPlans", studyPlans);

        // Transform study plans into upcoming deadlines format
        const upcomingDeadlines = studyPlans.slice(0, 3).map((plan: any, index: number) => ({
          title: `Study Plan for ${plan.subject?.name || 'General'}`,
          course: plan.subject?.name || 'General',
          dueDate: plan.timeFrame || 'This week',
          priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
        }));

        // Transform materials to include progress and type
        const transformedMaterials = materials.slice(0, 4).map((material: any) => ({
          ...material,
          type: material.fileType?.split('/')[1]?.toUpperCase() || 'DOCUMENT',
          updatedAt: material.uploadedAt
        }));

        setDashboardData({
          user: session?.user,
          stats: {
            studyStreak: analytics.studyStreak,
            totalDocuments: analytics.totalDocuments,
            totalFlashcards: analytics.totalFlashcards,
            totalPoints: analytics.totalPoints,
            upcomingAssignments: analytics.upcomingAssignments
          },
          materials: transformedMaterials,
          weeklyProgress: analytics.weeklyStudyTime,
          upcomingDeadlines
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep the fallback data that's already set in the initial state
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeSection user={dashboardData.user} stats={dashboardData.stats} />
      <QuickActions />
      <StudyProgress weeklyProgress={dashboardData.weeklyProgress} upcomingDeadlines={dashboardData.upcomingDeadlines} />
      <RecentMaterials materials={dashboardData.materials} />
    </div>
  );
}