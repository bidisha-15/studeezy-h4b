'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, Trash2, Edit2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  material?: {
    id: string;
    title: string;
    fileType: string;
  };
  questions: Question[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Material {
  id: string;
  title: string;
  processedText?: string;
  subject: {
    name: string;
  };
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [aiGenerationOpen, setAiGenerationOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    subjectId: '',
    questions: [] as {
      question: string;
      options: string[];
      answer: string;
    }[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesRes, subjectsRes, materialsRes] = await Promise.all([
        fetch('/api/quizzes'),
        fetch('/api/subjects'),
        fetch('/api/materials')
      ]);

      if (!quizzesRes.ok || !subjectsRes.ok || !materialsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [quizzesData, subjectsData, materialsData] = await Promise.all([
        quizzesRes.json(),
        subjectsRes.json(),
        materialsRes.json()
      ]);

      setQuizzes(quizzesData);
      setSubjects(subjectsData);
      setMaterials(materialsData.filter((m: Material) => m.processedText));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.title.trim() || newQuiz.questions.length === 0) return;

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuiz),
      });

      if (!response.ok) throw new Error('Failed to create quiz');

      toast.success('Quiz created successfully!');
      setCreateQuizOpen(false);
      setNewQuiz({
        title: '',
        subjectId: '',
        questions: [],
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!selectedMaterial) {
      toast.error('Please select a material');
      return;
    }

    setGenerating(true);
    try {
      const material = materials.find(m => m.id === selectedMaterial);
      const response = await fetch(`/api/ai/quiz/${selectedMaterial}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `AI Quiz for ${material?.title}`,
          questionCount: 5,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      toast.success('AI Quiz generated successfully!');
      setAiGenerationOpen(false);
      setSelectedMaterial('');
      fetchData();
    } catch (error) {
      toast.error('Failed to generate AI quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete quiz');

      toast.success('Quiz deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          question: '',
          options: ['', '', '', ''],
          answer: '',
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: string, value: string | string[]) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
            <p className="text-muted-foreground">
              Create and manage quizzes to test your knowledge
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={aiGenerationOpen} onOpenChange={setAiGenerationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Generate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate AI Quiz</DialogTitle>
                  <DialogDescription>
                    Generate a quiz automatically from your materials using AI.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Material</Label>
                    <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.title} ({material.subject.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAiGenerationOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleGenerateAIQuiz} 
                      disabled={!selectedMaterial || generating}
                    >
                      {generating ? 'Generating...' : 'Generate Quiz'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={createQuizOpen} onOpenChange={setCreateQuizOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Quiz</DialogTitle>
                  <DialogDescription>
                    Create a new quiz with multiple-choice questions.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateQuiz} className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Enter quiz title"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select value={newQuiz.subjectId} onValueChange={(value) => setNewQuiz({ ...newQuiz, subjectId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Questions</Label>
                      <Button type="button" variant="outline" onClick={addQuestion}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>

                    {newQuiz.questions.map((question, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div>
                          <Label>Question {index + 1}</Label>
                          <Input
                            placeholder="Enter question"
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(index, 'question', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(index, 'options', newOptions);
                                }}
                              />
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.answer === option}
                                onChange={() =>
                                  updateQuestion(index, 'answer', option)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateQuizOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Quiz</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="line-clamp-2">{quiz.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {quiz.material?.title || 'Manual Quiz'}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    Created {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{quiz.questions.length} questions</span>
                    <Button variant="outline" size="sm">
                      Start Quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first quiz to test your knowledge.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setAiGenerationOpen(true)} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
              <Button onClick={() => setCreateQuizOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    
  );
}
