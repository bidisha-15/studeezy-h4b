'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/types';
import { RotateCcw } from 'lucide-react';

interface FlashcardItemProps {
  flashcard: Flashcard;
}

export function FlashcardItem({ flashcard }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto h-64 cursor-pointer perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <CardContent className="absolute inset-0 w-full h-full flex items-center justify-center p-6 backface-hidden">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground">Question</h3>
            <p className="text-xl font-semibold">{flashcard.question}</p>
            <p className="text-sm text-muted-foreground">Click to reveal answer</p>
          </div>
        </CardContent>

        {/* Back */}
        <CardContent className="absolute inset-0 w-full h-full flex items-center justify-center p-6 backface-hidden rotate-y-180 bg-primary text-primary-foreground">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium opacity-90">Answer</h3>
            <p className="text-xl font-semibold">{flashcard.answer}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Flip Back
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}