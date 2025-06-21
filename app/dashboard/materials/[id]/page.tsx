'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileText, Send, Sparkles, Brain, CreditCard, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ChatMessageBubble } from '@/components/chat/chat-message-bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
  subject: {
    name: string;
    color: string;
  };
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  extractedText?: string;
  processedText?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showExtractedText, setShowExtractedText] = useState(false);

  useEffect(() => {
    if (materialId) {
      fetchMaterial();
    }
  }, [materialId]);

  const fetchMaterial = async () => {
    try {
      const response = await fetch(`/api/materials/${materialId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMaterial(data);
    } catch (error) {
      console.error('Fetch material error:', error);
      toast.error('Failed to fetch material');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!material?.extractedText && !material?.processedText) {
      toast.error('No extracted text available for this material. Text extraction is handled automatically during upload.');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch(`/api/materials/${materialId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: Message = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  const handleGenerateSummary = async () => {
    if (!material?.extractedText && !material?.processedText) {
      toast.error('No extracted text available for this material. Text extraction is handled automatically during upload.');
      return;
    }
    sendMessage('Please provide a comprehensive summary of this document.');
    toast.success('Summary requested! Check the chat below.');
  };

  const handleGenerateQuiz = async () => {
    if (!material?.extractedText && !material?.processedText) {
      toast.error('No extracted text available for this material. Text extraction is handled automatically during upload.');
      return;
    }

    try {
      toast.info('Generating quiz...');
      
      const response = await fetch(`/api/ai/quiz/${materialId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Quiz for ${material?.title}`,
          questionCount: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      toast.success(`Generated quiz with ${data.questions.length} questions! Check your quizzes page.`);
    } catch (error) {
      console.error('Generate quiz error:', error);
      toast.error('Failed to generate quiz');
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!material?.extractedText && !material?.processedText) {
      toast.error('No extracted text available for this material. Text extraction is handled automatically during upload.');
      return;
    }

    try {
      toast.info('Generating flashcards...');
      
      const response = await fetch(`/api/ai/flashcards/${materialId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardCount: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      toast.success(`Generated ${data.length} flashcards! Check your flashcards page.`);
    } catch (error) {
      console.error('Generate flashcards error:', error);
      toast.error('Failed to generate flashcards');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted rounded-lg animate-pulse" />
              <div className="h-48 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="h-96 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!material) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Material not found</h1>
          <p className="text-muted-foreground mt-2">
            The material you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/materials">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Materials
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasExtractedText = material.extractedText || material.processedText;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/materials">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{material.title}</h1>
            <p className="text-muted-foreground">{material.fileName}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Preview
                </CardTitle>
                <CardDescription>File information and content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {material.subject && (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: material.subject.color + '20',
                        color: material.subject.color,
                      }}
                    >
                      {material.subject.name}
                    </Badge>
                  )}
                  {material.tags?.length > 0 && material.tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>File size: {(material.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">File Preview</h4>
                  {material.fileType.startsWith('image/') ? (
                    <img
                      src={material.fileUrl}
                      alt={material.title}
                      className="w-full max-h-[600px] object-contain border rounded-md"
                    />
                  ) : material.fileType === 'application/pdf' ? (
                    <iframe
                      src={material.fileUrl}
                      title="PDF Preview"
                      className="w-full h-[600px] border rounded-md"
                    />
                  ) : (
                    <p className="text-muted-foreground">No preview available.</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Extracted Text
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowExtractedText((prev) => !prev)}
                      aria-label={showExtractedText ? 'Collapse' : 'Expand'}
                    >
                      {showExtractedText ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </h4>
                  {showExtractedText && (
                    hasExtractedText ? (
                      <ScrollArea className="h-64 w-full rounded-md border p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {material.extractedText || material.processedText || 'No text content extracted from this file.'}
                        </p>
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <p className="text-muted-foreground text-sm">
                          No text content extracted from this file. Text extraction is handled automatically during upload using AI-powered OCR.
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Tools
                </CardTitle>
                <CardDescription>
                  Generate study materials from this document
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Button variant="outline" onClick={handleGenerateSummary}>
                  <FileText className="mr-2 h-4 w-4" />
                  Summary
                </Button>
                <Button variant="outline" onClick={handleGenerateQuiz}>
                  <Brain className="mr-2 h-4 w-4" />
                  Quiz
                </Button>
                <Button variant="outline" onClick={handleGenerateFlashcards}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Flashcards
                </Button>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Chat with Document</CardTitle>
                <CardDescription>Ask questions about this material</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-4 pr-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>Start a conversation about this document!</p>
                        <p className="text-sm mt-1">
                          Ask questions, request explanations, or get summaries.
                        </p>
                      </div>
                    ) : (
                      messages.map(msg => <ChatMessageBubble key={msg.id} message={msg} />)
                    )}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={!hasExtractedText}
                  />
                  <Button type="submit" size="icon" disabled={!hasExtractedText}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {!hasExtractedText && (
                  <p className="text-xs text-muted-foreground">
                    Text extraction is handled automatically during upload. If no text is available, the file may not contain extractable content.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}