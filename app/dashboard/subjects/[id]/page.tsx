'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, BookOpen, ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';


interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  processedText?: string;
  subject: {
    id: string;
    name: string;
  };
  materialTags: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}

interface Subject {
  id: string;
  name: string;
}

interface SubjectData {
  subject: Subject;
  materials: Material[];
}

export default function MaterialsBySubject({ params }: { params: { id: string } }) {
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterialsBySubject();
  }, [params.id]);

  const fetchMaterialsBySubject = async () => {
    try {
      const response = await fetch(`/api/subjects/${params.id}/materials`);
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      const data = await response.json();
      setSubjectData(data);
    } catch (error) {
      console.error('Error fetching materials by subject:', error);
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
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
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/subjects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-8 bg-muted rounded animate-pulse w-48" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!subjectData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Subject not found</h3>
          <p className="text-muted-foreground mb-6">
            The subject you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard/subjects">
              Back to Subjects
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { subject, materials } = subjectData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/subjects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {subject.name}
              </h1>
              <p className="text-muted-foreground">
                {materials.length} material{materials.length !== 1 ? 's' : ''} in this subject
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/materials">
              <Upload className="mr-2 h-4 w-4" />
              Upload Material
            </Link>
          </Button>
        </div>

        {materials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="line-clamp-2">{material.title}</span>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {material.subject.name}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {material.materialTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {material.materialTags.map((materialTag) => (
                        <Badge
                          key={materialTag.tag.id}
                          variant="secondary"
                          style={{ 
                            backgroundColor: materialTag.tag.color + '20',
                            color: materialTag.tag.color,
                            border: `1px solid ${materialTag.tag.color}40`
                          }}
                        >
                          {materialTag.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(material.uploadedAt)}</span>
                    </div>
                    <span>{formatFileSize(material.fileSize)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/materials/${material.id}`}>
                        View Material
                      </Link>
                    </Button>
                    {material.processedText && (
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/materials/${material.id}#chat`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't uploaded any materials for {subject.name} yet.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/dashboard/materials">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Material
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/subjects">
                  Back to Subjects
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 