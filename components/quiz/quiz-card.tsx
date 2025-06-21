'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quiz } from '@/types';
import { Brain, Clock, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const averageScore = quiz.attempts.length > 0 
    ? Math.round(quiz.attempts.reduce((sum, attempt) => sum + attempt.score, 0) / quiz.attempts.length)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-base line-clamp-2">{quiz.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {quiz.material && (
          <Badge variant="secondary" className="text-xs">
            {quiz.material.title}
          </Badge>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{quiz.questions.length} questions</span>
          </div>
          {averageScore !== null && (
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>{averageScore}% avg</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(quiz.createdAt, { addSuffix: true })}
          </span>
          <Button asChild size="sm">
            <Link href={`/dashboard/quizzes/${quiz.id}/take`}>
              Take Quiz
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}