'use client';

import { useState, useEffect, use } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw, SkipForward, Check, X, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
  materialTags: {
    tag: {
      name: string;
      color: string;
    };
  }[];
}

interface StudySession {
  material: Material;
  flashcards: Flashcard[];
}

export default function FlashcardStudyPage({ params }: { params: Promise<{ materialId: string }> }) {
  const { materialId } = use(params);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });

  useEffect(() => {
    if (materialId) {
      fetchFlashcards();
    }
  }, [materialId]);

  const fetchFlashcards = async () => {
    try {
      console.log('Fetching flashcards for material:', materialId);
      
      // First try the direct API endpoint
      const directResponse = await fetch(`/api/flashcards/${materialId}`);
      if (directResponse.ok) {
        const directData = await directResponse.json();
        console.log('Direct API response:', directData);
        
        if (directData.length > 0) {
          // Group the flashcards for the study session
          const material = directData[0].material;
          const flashcards = directData.map((fc: any) => ({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
          }));
          
          const studyData = {
            material: {
              id: material.id,
              title: material.title,
              subject: material.subject,
              materialTags: material.materialTags,
            },
            flashcards,
          };
          
          console.log(`Found ${flashcards.length} flashcards via direct API`);
          setStudySession(studyData);
          return;
        }
      }
      
      // Fallback to grouped API
      console.log('Trying grouped API as fallback...');
      const response = await fetch(`/api/flashcards/grouped`);
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      
      const data = await response.json();
      console.log('All grouped flashcards:', data);
      
      const materialData = data.find((item: any) => item.material.id === materialId);
      console.log('Found material data:', materialData);
      
      if (!materialData) {
        console.error('No flashcards found for material ID:', materialId);
        toast.error('No flashcards found for this material');
        return;
      }

      if (!materialData.flashcards || materialData.flashcards.length === 0) {
        console.error('Material found but no flashcards:', materialData);
        toast.error('No flashcards available for this material');
        return;
      }

      console.log(`Found ${materialData.flashcards.length} flashcards for material`);
      setStudySession(materialData);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to fetch flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < studySession!.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleResponse = (response: 'correct' | 'incorrect' | 'skipped') => {
    setStats(prev => ({
      ...prev,
      [response]: prev[response] + 1,
    }));
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0, skipped: 0 });
  };

  const currentFlashcard = studySession?.flashcards[currentIndex];
  const progress = studySession ? ((currentIndex + 1) / studySession.flashcards.length) * 100 : 0;
  const totalResponses = stats.correct + stats.incorrect + stats.skipped;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!studySession) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No flashcards found</h3>
          <p className="text-muted-foreground mb-6">
            No flashcards are available for this material.
          </p>
          <Button asChild>
            <Link href="/dashboard/flashcards">
              Back to Flashcards
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
              <h1 className="text-2xl font-bold tracking-tight">
                Studying: {studySession.material.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {studySession.material.subject.name}
                </Badge>
                {studySession.material.materialTags.map((materialTag) => (
                  <Badge
                    key={materialTag.tag.name}
                    variant="outline"
                    style={{ 
                      borderColor: materialTag.tag.color,
                      color: materialTag.tag.color 
                    }}
                  >
                    {materialTag.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress: {currentIndex + 1} of {studySession.flashcards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.skipped}</div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard */}
        {currentFlashcard && (
          <div className="flex justify-center">
            <Card 
              className="w-full max-w-2xl cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={handleFlip}
            >
              <CardContent className="p-8 min-h-[400px] flex flex-col justify-center items-center">
                <div className="text-center space-y-4 w-full">
                  <div className="text-sm text-muted-foreground mb-4">
                    {isFlipped ? 'Answer' : 'Question'} • Click to flip
                  </div>
                  
                  <div className="text-xl font-medium leading-relaxed">
                    {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                  </div>
                  
                  {isFlipped && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm text-muted-foreground">How well did you know this?</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponse('incorrect');
                          }}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Incorrect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponse('skipped');
                          }}
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                          <SkipForward className="mr-1 h-4 w-4" />
                          Skip
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponse('correct');
                          }}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Correct
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === studySession.flashcards.length - 1}
          >
            Next
          </Button>
        </div>

        {/* Completion */}
        {currentIndex === studySession.flashcards.length - 1 && totalResponses === studySession.flashcards.length && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Study Session Complete! 🎉
              </h3>
              <p className="text-green-700 mb-4">
                You've completed all {studySession.flashcards.length} flashcards.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRestart} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Study Again
                </Button>
                <Button asChild>
                  <Link href="/dashboard/flashcards">
                    Back to Flashcards
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
} 