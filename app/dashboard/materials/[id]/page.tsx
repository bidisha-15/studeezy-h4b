'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Trash2,
  Edit,
  MessageSquare,
  Brain,
  CreditCard,
  Tag,
  GraduationCap
} from 'lucide-react';
import { ChatMessageBubble } from '@/components/chat/chat-message-bubble';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  processedText?: string;
  subject: {
    id: string;
    name: string;
    color: string;
  };
  materialTags: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchMaterialDetails();
    }
  }, [id]);

  const fetchMaterialDetails = async () => {
    try {
      const response = await fetch(`/api/materials/${id}`);
      if (!response.ok) throw new Error('Failed to fetch material details');
      const data = await response.json();
      setMaterial(data);
    } catch (error) {
      toast.error('Failed to fetch material details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete material');

      toast.success('Material deleted successfully!');
      router.push('/dashboard/materials');
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = userMessage.trim();
    if (!content || chatLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setChatLoading(true);

    try {
      const response = await fetch(`/api/materials/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const assistantResponse: Message = await response.json();
      setMessages(prev => [...prev, assistantResponse]);

    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
    } finally {
      setChatLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Material not found</h1>
        <Button asChild className="mt-4">
          <Link href="/dashboard/materials">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Materials
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
            <Link href="/dashboard/materials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{material.title}</h1>
            <p className="text-muted-foreground">{material.fileName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={material.fileUrl} download={material.fileName}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button variant="destructive" onClick={handleDeleteMaterial}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {material.processedText && (
            <TabsTrigger value="text">Extracted Text</TabsTrigger>
          )}
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className='flex gap-2'>
                    <span className="font-medium">File Type:</span>
                    <p className="text-muted-foreground">
                      {material.fileType.toUpperCase().startsWith("IMAGE/") ? (
                        `Image (${material.fileType.split("/")[1].toUpperCase()})`
                      ) : material.fileType.toUpperCase() === "APPLICATION/PDF" ? (
                        "PDF"
                      ) : (
                        material.fileType
                      )}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <span className="font-medium">File Size:</span>
                    <p className="text-muted-foreground">{formatFileSize(material.fileSize)}</p>
                  </div>
                  <div className='flex gap-2'>
                    <span className="font-medium">Uploaded:</span>
                    <p className="text-muted-foreground">{formatDate(material.uploadedAt)}</p>
                  </div>
                  <div className='flex gap-2'>
                    <span className="font-medium">Subject:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: material.subject.color }}
                      />
                      <span className="text-muted-foreground">{material.subject.name}</span>
                    </div>
                  </div>
                </div>
                <div className='flex gap-2 items-center'>
                  <span className="font-medium">Tags:</span>
                  {material.materialTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {material.materialTags.map((mt) => (
                        <Badge
                          key={mt.tag.id}
                          variant="secondary"
                          style={{
                            backgroundColor: mt.tag.color + '20',
                            color: mt.tag.color,
                            border: `1px solid ${mt.tag.color}40`
                          }}
                        >
                          {mt.tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-2">No tags assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Display actual material file */}
          <div className="w-full flex justify-center mt-6">
            {material.fileType.startsWith('image/') ? (
              <img
                src={material.fileUrl}
                alt={material.fileName}
                className="max-h-[500px] rounded shadow border"
                style={{ maxWidth: '100%' }}
              />
            ) : material.fileType === 'application/pdf' ? (
              <iframe
                src={material.fileUrl}
                title={material.fileName}
                className="w-full h-[600px] rounded shadow border"
                style={{ minHeight: 400 }}
              />
            ) : (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View or download file
              </a>
            )}
          </div>
        </TabsContent>

        {/* Extracted Text Tab */}
        {material.processedText && (
          <TabsContent value="text" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Text</CardTitle>
                <CardDescription>
                  Text extracted from the uploaded document using OCR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{material.processedText}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat
              </CardTitle>
              <CardDescription>
                Ask questions about this material and get AI-powered responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>Start a conversation about this material</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <ChatMessageBubble message={message} />
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask a question about this material..."
                  className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={chatLoading}
                />
                <Button type="submit" disabled={chatLoading || !userMessage.trim()}>
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Flashcards
              </CardTitle>
              <CardDescription>
                Generate and study flashcards from this material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generate Flashcards</h3>
                <p className="text-muted-foreground mb-4">
                  Create flashcards to help you memorize key concepts from this material.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/flashcards/study/${material.id}`}>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Flashcards
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quiz
              </CardTitle>
              <CardDescription>
                Test your knowledge with AI-generated quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create Quiz</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a quiz to test your understanding of this material.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/quizzes?materialId=${material.id}`}>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}