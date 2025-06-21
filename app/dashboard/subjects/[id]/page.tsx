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
  Plus, 
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
  materialTags: {
    tag: {
      name: string;
      color: string;
    };
  }[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  materials: Material[];
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectColor, setSubjectColor] = useState('#3B82F6');

  const fetchSubjectDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`);
      if (!response.ok) throw new Error('Failed to fetch subject details');
      const data = await response.json();
      setSubject(data);
      setSubjectName(data.name);
      setSubjectCode(data.code);
      setSubjectColor(data.color || '#3B82F6');
    } catch (error) {
      console.error('Failed to fetch subject details:', error);
      toast.error('Failed to fetch subject details');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    if (subjectId) {
      fetchSubjectDetails();
    }
  }, [subjectId, fetchSubjectDetails]);

  const handleUpdateSubject = async () => {
    if (!subjectName.trim()) return;

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subjectName,
          code: subjectCode,
          color: subjectColor,
        }),
      });

      if (!response.ok) throw new Error('Failed to update subject');

      toast.success('Subject updated successfully!');
      setEditMode(false);
      fetchSubjectDetails();
    } catch (error) {
      console.error('Failed to update subject:', error);
      toast.error('Failed to update subject');
    }
  };

  const handleDeleteSubject = async () => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated materials.')) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');

      toast.success('Subject deleted successfully!');
      router.push('/dashboard/subjects');
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast.error('Failed to delete subject');
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

  if (!subject) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Subject not found</h1>
        <Button asChild className="mt-4">
          <Link href="/dashboard/subjects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subjects
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
            <Link href="/dashboard/subjects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-muted-foreground">Subject Code: {subject.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditMode(!editMode)}>
            <Edit className="mr-2 h-4 w-4" />
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="destructive" onClick={handleDeleteSubject}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Subject</CardTitle>
            <CardDescription>Update subject information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject Name</label>
              <Input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject Code</label>
              <Input
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="Enter subject code"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
                className="w-20 h-10"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubject}>Update Subject</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Materials ({subject.materials.length})
          </CardTitle>
          <CardDescription>
            Study materials for this subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subject.materials.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first study material for this subject.
              </p>
              <Button asChild>
                <Link href="/dashboard/materials">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subject.materials.map((material) => (
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
                    {material.materialTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {material.materialTags.map((mt) => (
                          <Badge key={mt.tag.name} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {mt.tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
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