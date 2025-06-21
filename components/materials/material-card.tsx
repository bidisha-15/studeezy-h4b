'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Material } from '@/types';
import { FileText, MessageSquare, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface MaterialCardProps {
  material: Material;
  onDelete?: (id: string) => void;
}

export function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(material.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base line-clamp-1">{material.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/materials/${material.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/materials/${material.id}#chat`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{material.fileName}</span>
          <span>•</span>
          <span>{formatFileSize(material.fileSize)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {material.subject && (
            <Badge variant="secondary" style={{ backgroundColor: material.subject.color + '20', color: material.subject.color }}>
              {material.subject.name}
            </Badge>
          )}
          {material.tags.map(tag => (
            <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(material.uploadedAt, { addSuffix: true })}
          </span>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/materials/${material.id}`}>
                <Eye className="mr-2 h-3 w-3" />
                View
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/dashboard/materials/${material.id}#chat`}>
                <MessageSquare className="mr-2 h-3 w-3" />
                Chat
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}