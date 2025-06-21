'use client';

import { Message } from 'ai/react';
import { Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessageBubble({ message, isLoading }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div
        className={cn(
          'p-3 rounded-lg max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : message.content}
        </p>
        <p className="text-xs text-muted-foreground mt-2 opacity-70">
          {format(new Date(message.createdAt || new Date()), 'p')}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
