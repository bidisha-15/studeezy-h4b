// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Play, Pause, RotateCcw, Target } from 'lucide-react';
// import { toast } from 'sonner';

// const PRESETS = [15, 25, 50]; 

// export default function FocusSessionPage() {
//   const [duration, setDuration] = useState(25 * 60);
//   const [time, setTime] = useState(duration);
//   const [isActive, setIsActive] = useState(false);
//   const [sessionsCompleted, setSessionsCompleted] = useState(0);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     if (!isActive) {
//       setTime(duration);
//     }
//   }, [duration, isActive]);

//   useEffect(() => {
//     if (isActive && time > 0) {
//       timerRef.current = setInterval(() => {
//         setTime(prevTime => prevTime - 1);
//       }, 1000);
//     } else if (time === 0 && isActive) {
//       clearInterval(timerRef.current!);
//       setIsActive(false);
//       setSessionsCompleted(prev => prev + 1);
//       toast.success("Time's up! Take a short break.");
//     }
    
//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [isActive, time]);
  
//   const toggleTimer = () => {
//     if (time === 0) {
//         setTime(duration);
//     }
//     setIsActive(!isActive);
//   };

//   const resetTimer = () => {
//     setIsActive(false);
//     setTime(duration);
//   };

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const progress = duration > 0 ? ((duration - time) / duration) : 0;
//   const circumference = 2 * Math.PI * 45;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p- bg-backgroun">
//       <Card className="w-full max-w-md shadow-lg border-2 border-primary/10 transition-all hover:shadow-primary/10">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
//             <Target className="h-8 w-8 text-primary" />
//             Focus Session
//           </CardTitle>
//           <p className="text-muted-foreground">Stay focused, get work done.</p>
//         </CardHeader>
//         <CardContent className="flex flex-col items-center space-y-4 pt-4">
          
//           <div className="flex flex-wrap items-center justify-center gap-2">
//             <span className="text-sm font-medium text-muted-foreground">Duration:</span>
//             {PRESETS.map(preset => (
//               <Button
//                 key={preset}
//                 variant={duration === preset * 60 ? 'default' : 'secondary'}
//                 size="sm"
//                 onClick={() => setDuration(preset * 60)}
//                 disabled={isActive}
//                 className="transition-all"
//               >
//                 {preset} min
//               </Button>
//             ))}
//           </div>

//           <div className="relative w-64 h-64">
//             <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
//               <circle
//                 className="text-muted/50"
//                 stroke="currentColor"
//                 strokeWidth="8"
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 fill="transparent"
//               />
//               <circle
//                 className="text-primary"
//                 stroke="currentColor"
//                 strokeWidth="8"
//                 cx="50"
//                 cy="50"
//                 r="45"
//                 fill="transparent"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={circumference * (1 - progress)}
//                 transform="rotate(-90 50 50)"
//                 strokeLinecap="round"
//                 style={{ transition: 'stroke-dashoffset 1s linear' }}
//               />
//             </svg>
//              <div className="absolute inset-0 flex items-center justify-center">
//               <span className="z-10 text-6xl font-mono tracking-tighter text-foreground">
//                 {formatTime(time)}
//               </span>
//             </div>
//           </div>

//           <div className="flex space-x-4">
//             <Button onClick={toggleTimer} size="lg" className="w-36 text-lg rounded-full shadow-md hover:shadow-lg transition-shadow">
//               {isActive ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
//               {isActive ? 'Pause' : 'Start'}
//             </Button>
//             <Button onClick={resetTimer} variant="outline" size="lg" className="text-lg rounded-full">
//               <RotateCcw className="mr-2 h-6 w-6" />
//             </Button>
//           </div>
          
//           <div className="text-center bg-muted/50 p-3 rounded-lg w-full">
//             <p className="font-bold text-2xl text-primary">{sessionsCompleted}</p>
//             <p className="text-sm text-muted-foreground">Sessions Completed</p>
//           </div>
//         </CardContent>
//       </Card>
//       <p className="text-xs text-muted-foreground mt-4">Tip: Take a 5-minute break after each focus session.</p>
//     </div>
//   );
// }
"use client";
import { useState, useEffect, useRef } from 'react';

interface FocusSession {
  id: string;
  date: string;
  minutes: number;
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);

  const totalCycles = 4;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('focusHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as FocusSession[];
        setSessionHistory(parsed);
        const total = parsed.reduce((sum, session) => sum + session.minutes, 0);
        setTotalFocusMinutes(total);
      } catch (e) {
        localStorage.removeItem('focusHistory');
      }
    }
  }, []);

  useEffect(() => {
    resetTimer();
  }, [focusDuration, breakDuration]);

  useEffect(() => {
    const totalDuration = (isFocus ? focusDuration : breakDuration) * 60;
    const percentage = (timeLeft / totalDuration) * 283;

    if (progressCircleRef.current) {
      progressCircleRef.current.style.strokeDashoffset = percentage.toString();
      progressCircleRef.current.style.stroke = isFocus ? '#111111' : '#444444';
    }
  }, [timeLeft, isFocus, focusDuration, breakDuration]);

  const saveSession = (minutes: number) => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      minutes
    };

    const updatedHistory = [...sessionHistory, newSession];
    setSessionHistory(updatedHistory);
    localStorage.setItem('focusHistory', JSON.stringify(updatedHistory));
    setTotalFocusMinutes(totalFocusMinutes + minutes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setIsFocus(true);
    setCurrentCycle(1);
    setTimeLeft(focusDuration * 60);
  };

  const handleTimerCompletion = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);

    if (isFocus) {
      saveSession(focusDuration);
      const nextCycle = currentCycle + 1;
      if (nextCycle > totalCycles) {
        resetTimer();
        return;
      }
      setCurrentCycle(nextCycle);
      setIsFocus(false);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsFocus(true);
      setTimeLeft(focusDuration * 60);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all your focus history?')) {
      localStorage.removeItem('focusHistory');
      setSessionHistory([]);
      setTotalFocusMinutes(0);
    }
  };

  const totalFocusHours = Math.floor(totalFocusMinutes / 60);
  const remainingFocusMinutes = totalFocusMinutes % 60;

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center p-4 pt-10">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-center mb-6">Focus Timer</h1>

            <div className="flex justify-center mb-6">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#d1d5db" strokeWidth="8"/>
                  <circle
                    ref={progressCircleRef}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset="283"
                    className="origin-center -rotate-90 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {isFocus ? 'Focus' : 'Break'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-8">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-center">Timer Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Focus (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={focusDuration}
                    onChange={(e) => setFocusDuration(Math.max(1, Math.min(60, Number(e.target.value))))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Break (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(Math.max(1, Math.min(60, Number(e.target.value))))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Focus History</h2>
              <button 
                onClick={clearHistory}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Clear All
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
              <div className="text-sm text-gray-600 mb-1">Total Focus Time</div>
              <div className="text-3xl font-bold text-black">
                {totalFocusHours > 0 && `${totalFocusHours}h `}{remainingFocusMinutes}m
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {sessionHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No focus sessions recorded yet</p>
                </div>
              ) : (
                [...sessionHistory].reverse().map(session => (
                  <div key={session.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{formatDate(session.date)}</div>
                      <div className="text-sm text-gray-500">
                        {session.minutes} minute{session.minutes !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      +{session.minutes}m
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}