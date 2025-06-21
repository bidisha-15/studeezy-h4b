'use client';

import { Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

const mockUser = {
  name: 'John Doe',
  avatar: '/avatar.jpg',
};

export function ChatMessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback>
              {mockUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
