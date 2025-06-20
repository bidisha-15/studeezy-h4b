'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
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

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function MaterialsByTag({ params }: { params: { id: string } }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterialsByTag();
  }, [params.id]);

  const fetchMaterialsByTag = async () => {
    try {
      const response = await fetch(`/api/tags/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      const data = await response.json();
      setMaterials(data);
      
      // Extract tag info from the first material's tags
      if (data.length > 0 && data[0].materialTags) {
        const currentTag = data[0].materialTags.find((mt: any) => mt.tag.id === params.id);
        if (currentTag) {
          setTag(currentTag.tag);
        }
      }
    } catch (error) {
      console.error('Error fetching materials by tag:', error);
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
              <Link href="/dashboard/tags">
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/tags">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tag ? `Materials tagged "${tag.name}"` : 'Materials by Tag'}
            </h1>
            <p className="text-muted-foreground">
              {materials.length} material{materials.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {tag && (
            <Badge 
              style={{ backgroundColor: tag.color, color: 'white' }}
              className="ml-auto"
            >
              {tag.name}
            </Badge>
          )}
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
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(material.uploadedAt)}</span>
                    </div>
                    <span>{formatFileSize(material.fileSize)}</span>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/dashboard/materials/${material.id}`}>
                      View Material
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-6">
              No materials are tagged with this tag yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/materials">
                Browse Materials
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}