'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Target } from 'lucide-react';
import { toast } from 'sonner';

const PRESETS = [15, 25, 50]; 

export default function FocusSessionPage() {
  const [duration, setDuration] = useState(25 * 60);
  const [time, setTime] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      setTime(duration);
    }
  }, [duration, isActive]);

  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      clearInterval(timerRef.current!);
      setIsActive(false);
      setSessionsCompleted(prev => prev + 1);
      toast.success("Time's up! Take a short break.");
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, time]);
  
  const toggleTimer = () => {
    if (time === 0) {
        setTime(duration);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(duration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - time) / duration) : 0;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p- bg-backgroun">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10 transition-all hover:shadow-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Focus Session
          </CardTitle>
          <p className="text-muted-foreground">Stay focused, get work done.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 pt-4">
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Duration:</span>
            {PRESETS.map(preset => (
              <Button
                key={preset}
                variant={duration === preset * 60 ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setDuration(preset * 60)}
                disabled={isActive}
                className="transition-all"
              >
                {preset} min
              </Button>
            ))}
          </div>

          <div className="relative w-64 h-64">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted/50"
                stroke="currentColor"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
              />
              <circle
                className="text-primary"
                stroke="currentColor"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
             <div className="absolute inset-0 flex items-center justify-center">
              <span className="z-10 text-6xl font-mono tracking-tighter text-foreground">
                {formatTime(time)}
              </span>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={toggleTimer} size="lg" className="w-36 text-lg rounded-full shadow-md hover:shadow-lg transition-shadow">
              {isActive ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg" className="text-lg rounded-full">
              <RotateCcw className="mr-2 h-6 w-6" />
            </Button>
          </div>
          
          <div className="text-center bg-muted/50 p-3 rounded-lg w-full">
            <p className="font-bold text-2xl text-primary">{sessionsCompleted}</p>
            <p className="text-sm text-muted-foreground">Sessions Completed</p>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-4">Tip: Take a 5-minute break after each focus session.</p>
    </div>
  );
}
