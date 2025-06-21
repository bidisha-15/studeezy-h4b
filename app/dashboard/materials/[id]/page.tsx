'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Trash2, 
  MessageSquare,
  Brain,
  CreditCard,
  Tag
} from 'lucide-react';
import { ChatMessageBubble } from '@/components/chat/chat-message-bubble';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from 'ai/react';

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

export default function MaterialDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchMaterialDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/materials/${id}`);
      if (!response.ok) throw new Error('Failed to fetch material details');
      const data = await response.json();
      setMaterial(data);
    } catch (error) {
      console.error('Failed to fetch material details:', error);
      toast.error('Failed to fetch material details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/materials/${id}/chat`);
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMaterialDetails();
      fetchChatHistory();
    }
  }, [id, fetchMaterialDetails, fetchChatHistory]);

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
      console.error('Failed to delete material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim() || chatLoading) return;

    const message = userMessage.trim();
    setUserMessage('');
    setChatLoading(true);

    const newMessages: Message[] = [
      ...chatMessages,
      {
        id: Date.now().toString(),
        role: 'user',
        content: message,
      },
    ];

    setChatMessages(newMessages);

    try {
      const response = await fetch(`/api/materials/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      setChatMessages([
        ...newMessages,
        {
          id: data.id || Date.now().toString(),
          role: 'assistant',
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // Remove the failed message
      setChatMessages(prev => prev.slice(0, -1));
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">File Type:</span>
                    <p className="text-muted-foreground">{material.fileType.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="font-medium">File Size:</span>
                    <p className="text-muted-foreground">{formatFileSize(material.fileSize)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span>
                    <p className="text-muted-foreground">{formatDate(material.uploadedAt)}</p>
                  </div>
                  <div>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {material.materialTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
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
                  <p className="text-muted-foreground">No tags assigned</p>
                )}
              </CardContent>
            </Card>
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
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>Start a conversation about this material</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <ChatMessageBubble
                        message={message}
                        isLoading={chatLoading && message.role === 'user' && message.id === chatMessages[chatMessages.length - 1]?.id}
                      />
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