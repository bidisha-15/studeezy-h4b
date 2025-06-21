'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  X, 
  Brain,
  CreditCard,
  BookOpen
} from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Material {
  id: string;
  title: string;
  subject: {
    name: string;
  };
}

export default function FlashcardStudyPage({ params }: { params: Promise<{ materialId: string }> }) {
  const { materialId } = use(params);
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [material, setMaterial] = useState<Material | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  useEffect(() => {
    if (materialId) {
      fetchMaterial();
      fetchFlashcards();
    }
  }, [materialId]);

  const fetchMaterial = async () => {
    try {
      const response = await fetch(`/api/materials/${materialId}`);
      if (response.ok) {
        const data = await response.json();
        setMaterial(data);
      }
    } catch (error) {
      console.error('Failed to fetch material:', error);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(`/api/flashcards?materialId=${materialId}`);
      if (response.ok) {
        const data = await response.json();
        setFlashcards(data);
        setStudyStats(prev => ({ ...prev, total: data.length }));
      }
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/ai/flashcards/${materialId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardCount: 10 }),
      });

      if (!response.ok) throw new Error('Failed to generate flashcards');

      toast.success('Flashcards generated successfully!');
      fetchFlashcards();
    } catch (error) {
      toast.error('Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setStudyStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // Study session completed
      toast.success('Study session completed!');
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudyStats({
      correct: 0,
      incorrect: 0,
      total: flashcards.length,
    });
  };

  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const accuracy = studyStats.total > 0 ? (studyStats.correct / studyStats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Material not found</h1>
        <Button asChild className="mt-4">
          <Link href="/dashboard/flashcards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flashcards
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/flashcards">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Flashcards</h1>
            <p className="text-muted-foreground">
              {material.title} • {material.subject.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetStudy}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
          
          {studyStats.total > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{studyStats.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{studyStats.incorrect}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flashcards */}
      {flashcards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              No Flashcards Available
            </CardTitle>
            <CardDescription>
              Generate flashcards to start studying this material
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No flashcards have been generated for this material yet.
            </p>
            <Button onClick={generateFlashcards} disabled={generating}>
              <Brain className="mr-2 h-4 w-4" />
              {generating ? 'Generating...' : 'Generate Flashcards'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="min-h-[400px]">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Question */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-muted-foreground">Question</h3>
                <div className="text-2xl font-semibold leading-relaxed">
                  {flashcards[currentIndex]?.question}
                </div>
              </div>

              {/* Answer */}
              {showAnswer && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium text-muted-foreground">Answer</h3>
                  <div className="text-xl leading-relaxed">
                    {flashcards[currentIndex]?.answer}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4 pt-6">
                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} size="lg">
                    Show Answer
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswer(false)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Incorrect
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => handleAnswer(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Correct
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Complete */}
      {currentIndex >= flashcards.length && flashcards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Study Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Great job!</h3>
            <p className="text-muted-foreground mb-6">
              You've completed studying all {flashcards.length} flashcards.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-green-600">{studyStats.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{studyStats.incorrect}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={resetStudy} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Study Again
              </Button>
              <Button asChild>
                <Link href="/dashboard/flashcards">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Back to Flashcards
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 