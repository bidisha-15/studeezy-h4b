'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  Tag
} from 'lucide-react';

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  subject: {
    name: string;
    color: string;
  };
}

interface TagData {
  id: string;
  name: string;
  color: string;
  materials: Material[];
}

export default function TagDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.id as string;

  const [tag, setTag] = useState<TagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');

  const fetchTagDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/tags/${tagId}`);
      if (!response.ok) throw new Error('Failed to fetch tag details');
      const data = await response.json();
      setTag(data);
      setTagName(data.name);
      setTagColor(data.color || '#3B82F6');
    } catch (error) {
      console.error('Failed to fetch tag details:', error);
      toast.error('Failed to fetch tag details');
    } finally {
      setLoading(false);
    }
  }, [tagId]);

  useEffect(() => {
    if (tagId) {
      fetchTagDetails();
    }
  }, [tagId, fetchTagDetails]);

  const handleUpdateTag = async () => {
    if (!tagName.trim()) return;

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tagName,
          color: tagColor,
        }),
      });

      if (!response.ok) throw new Error('Failed to update tag');

      toast.success('Tag updated successfully!');
      setEditMode(false);
      fetchTagDetails();
    } catch (error) {
      console.error('Failed to update tag:', error);
      toast.error('Failed to update tag');
    }
  };

  const handleDeleteTag = async () => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all associated materials.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tag');

      toast.success('Tag deleted successfully!');
      router.push('/dashboard/tags');
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast.error('Failed to delete tag');
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
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Tag not found</h1>
        <Button asChild className="mt-4">
          <Link href="/dashboard/tags">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tags
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
            <Link href="/dashboard/tags">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Badge 
              style={{ 
                backgroundColor: tag.color + '20', 
                color: tag.color,
                border: `1px solid ${tag.color}40`
              }}
              className="text-lg px-3 py-1"
            >
              {tag.name}
            </Badge>
            <span className="text-muted-foreground">
              {tag.materials.length} material{tag.materials.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            <Edit className="mr-2 h-4 w-4" />
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="destructive" onClick={handleDeleteTag}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Tag</CardTitle>
            <CardDescription>Update tag information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tag Name</label>
              <Input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="w-20 h-10"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTag}>Update Tag</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tagged Materials ({tag.materials.length})
          </CardTitle>
          <CardDescription>
            Materials tagged with &quot;{tag.name}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tag.materials.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No materials tagged</h3>
              <p className="text-muted-foreground mb-4">
                No materials are currently tagged with &quot;{tag.name}&quot;.
              </p>
              <Button asChild>
                <Link href="/dashboard/materials">
                  View All Materials
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tag.materials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {material.title}
                    </CardTitle>
                    <CardDescription>{material.fileName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(material.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(material.fileSize)}</span>
                      <span>•</span>
                      <span>{material.fileType.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Subject: {material.subject.name}</span>
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/dashboard/materials/${material.id}`}>
                        View Material
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}