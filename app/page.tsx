'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Brain,
  MessageSquare,
  Upload,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Github,
  Twitter,
  Mail
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserNav } from '@/components/UserNav';

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
};

const Header = () => {
  const router = useRouter();
  const { status } = useSession();

  return (
    <motion.header
      className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Studeezy
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </a>
            <ThemeToggle />

            <div className="flex items-center gap-x-2">
              {status === 'loading' ? (
                <div className="h-10 w-28 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
              ) : status === 'authenticated' ? (
                <UserNav />
              ) : (
                <>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => router.push('/signin')}>
                    Sign In
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700" onClick={() => router.push('/signup')}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const Hero = () => (
  <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4 mr-2" />
          AI-Powered Study Revolution
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
        >
          Transform Your Study Materials
          <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            with Artificial Intelligence
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Upload your documents, extract text with OCR, chat with your study materials, and organize notes like never before.
          Let AI be your personal study assistant.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Learning Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 hover:border-blue-300 px-8 py-3 text-lg font-medium"
          >
            Watch Demo
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Free Forever Plan</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>10,000+ Students</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: "Smart Document Upload",
      description: "Upload PDFs, images, and documents. Our OCR technology extracts text with 99% accuracy.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "AI Chat with Documents",
      description: "Ask questions about your study materials and get instant, contextual answers powered by AI.",
      color: "from-violet-500 to-violet-600"
    },
    {
      icon: Brain,
      title: "AI-Generated Flashcards",
      description: "Automatically create flashcards from your content. Perfect for memorization and quick reviews.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: BookOpen,
      title: "Smart Note Organization",
      description: "AI categorizes and tags your notes automatically. Find what you need in seconds.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Collaborate with classmates, share notes, and study together in virtual study rooms.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and personalized study recommendations.",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Smarter Studying
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to transform your study experience and achieve academic excellence
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      university: "Stanford University",
      content: "Studeezy transformed how I study for my medical exams. The AI-generated flashcards from my textbooks saved me hours of preparation time.",
      avatar: "SC",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Computer Science Major",
      university: "MIT",
      content: "Being able to chat with my programming textbooks and get instant explanations is incredible. It's like having a personal tutor 24/7.",
      avatar: "MR",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Law Student",
      university: "Harvard Law",
      content: "The document organization features are amazing. I can find any case study or legal document in seconds. It's revolutionized my research process.",
      avatar: "EW",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by Students
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of students who have already transformed their study experience
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {testimonial.university}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-violet-600">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Study Experience?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of students who are already studying smarter with AI-powered tools
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-white border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-medium"
          >
            Schedule Demo
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Studeezy</span>
          </div>
          <p className="text-gray-400 mb-6 max-w-md">
            Empowering students worldwide with AI-powered study tools. Transform your learning experience and achieve academic excellence.
          </p>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Github className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Mail className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AI Integrations</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">
          © 2025 Studeezy. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}