'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, Trash2, Sparkles, Play, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Material {
  id: string;
  title: string;
  subject: {
    name: string;
  };
  materialTags: {
    tag: {
      name: string;
      color: string;
    };
  }[];
}

interface GroupedFlashcards {
  material: Material;
  flashcards: Flashcard[];
}

export default function FlashcardsPage() {
  const [groupedFlashcards, setGroupedFlashcards] = useState<GroupedFlashcards[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<GroupedFlashcards[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'subject' | 'tag'>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  useEffect(() => {
    fetchGroupedFlashcards();
  }, []);

  useEffect(() => {
    filterFlashcards();
  }, [groupedFlashcards, filterType, selectedFilter]);

  const fetchGroupedFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards/grouped');
      if (!response.ok) throw new Error('Failed to fetch flashcards');
      const data = await response.json();
      setGroupedFlashcards(data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to fetch flashcards');
    } finally {
      setLoading(false);
    }
  };

  const filterFlashcards = () => {
    if (filterType === 'all') {
      setFilteredFlashcards(groupedFlashcards);
      return;
    }

    const filtered = groupedFlashcards.filter(group => {
      if (filterType === 'subject') {
        return group.material.subject.name === selectedFilter;
      } else if (filterType === 'tag') {
        return group.material.materialTags.some(mt => mt.tag.name === selectedFilter);
      }
      return true;
    });

    setFilteredFlashcards(filtered);
  };

  const getUniqueSubjects = () => {
    const subjects = new Set(groupedFlashcards.map(group => group.material.subject.name));
    return Array.from(subjects).sort();
  };

  const getUniqueTags = () => {
    const tags = new Set<string>();
    groupedFlashcards.forEach(group => {
      group.material.materialTags.forEach(mt => tags.add(mt.tag.name));
    });
    return Array.from(tags).sort();
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete flashcard');

      toast.success('Flashcard deleted successfully!');
      fetchGroupedFlashcards();
    } catch (error) {
      toast.error('Failed to delete flashcard');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse w-48" />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
            <p className="text-muted-foreground">
              Study with AI-generated flashcards from your materials
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/materials">
              <Plus className="mr-2 h-4 w-4" />
              Generate from Material
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select value={filterType} onValueChange={(value: 'all' | 'subject' | 'tag') => {
            setFilterType(value);
            setSelectedFilter('');
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              <SelectItem value="subject">By Subject</SelectItem>
              <SelectItem value="tag">By Tag</SelectItem>
            </SelectContent>
          </Select>

          {filterType !== 'all' && (
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={`Select ${filterType}...`} />
              </SelectTrigger>
              <SelectContent>
                {filterType === 'subject' && getUniqueSubjects().map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
                {filterType === 'tag' && getUniqueTags().map((tag: string) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {filteredFlashcards.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFlashcards.map((group) => (
              <Card key={group.material.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <span className="line-clamp-2">{group.material.title}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {group.material.subject.name}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {group.material.materialTags.map((materialTag) => (
                      <Badge
                        key={materialTag.tag.name}
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
                  
                  <div className="text-sm text-muted-foreground">
                    {group.flashcards.length} flashcard{group.flashcards.length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/flashcards/study/${group.material.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Study
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/dashboard/materials/${group.material.id}`}>
                        <BookOpen className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {groupedFlashcards.length === 0 ? 'No flashcards yet' : 'No flashcards match your filter'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {groupedFlashcards.length === 0 
                ? 'Generate flashcards from your materials to start studying.'
                : 'Try adjusting your filter or generate more flashcards.'
              }
            </p>
            <Button asChild>
              <Link href="/dashboard/materials">
                <Plus className="mr-2 h-4 w-4" />
                Generate from Material
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}