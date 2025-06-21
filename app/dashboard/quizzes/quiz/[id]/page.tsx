"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  answer: string;
}

export default function QuizPage() {
  const { id } = useParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

//   const progress = (currentIndex / questions.length) * 100;
const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    async function fetchQuestions() {
      const res = await fetch(`/api/quizzes/questions/${id}`);
      const data = await res.json();
      setQuestions(data);
    }
    if (id) fetchQuestions();
  }, [id]);

  const handleNext = () => {
    if (selectedOption === questions[currentIndex].answer) {
      setScore(score + 1);
    }
    if (currentIndex === questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsCompleted(false);
  };

  if (questions.length === 0) {
    return <p className="text-center mt-10">Loading quiz...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/quizzes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Quiz
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{`Questions: ${questions.length}`}</Badge>
              <Badge variant="outline" style={{ borderColor: "#22c55e", color: "#22c55e" }}>
                Score: {score}
              </Badge>
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
          <span>
            Progress: {currentIndex} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {currentIndex + 1 - score}
            </div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.length - (currentIndex + 1)}
            </div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      {isCompleted ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Quiz Completed! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              You scored {score}/{questions.length}.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Quiz
              </Button>
              <Button asChild>
                <Link href="/dashboard/quizzes">Back to Quizzes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 flex flex-col items-center space-y-6">
              <h2 className="text-xl font-medium text-center">
                {questions[currentIndex].question}
              </h2>
              <div className="w-full space-y-2">
                {questions[currentIndex].options.map((option) => (
                  <label
                    key={option}
                    className={`block p-2 border rounded cursor-pointer ${
                      selectedOption === option ? "bg-blue-100" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentIndex}`}
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => setSelectedOption(option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={!selectedOption}
                className="mt-2"
              >
                {currentIndex === questions.length - 1 ? "Submit" : "Next"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
