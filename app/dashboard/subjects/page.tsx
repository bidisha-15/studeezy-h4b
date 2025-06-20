'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface Subject {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast.error("Failed to fetch subjects");
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) throw new Error('Failed to create subject');

      toast.success("Subject created successfully");
      setIsDialogOpen(false);
      setNewSubject({ name: '', code: '' });
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to create subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (deletingId === id) return; // Prevent double-clicking
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');

      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to delete subject');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">
              Manage your academic subjects and organize your materials
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input
                    id="code"
                    value={newSubject.code}
                    onChange={(e) =>
                      setNewSubject((prev) => ({ ...prev, code: e.target.value }))
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Subject
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {subjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {subject.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubject(subject.id)}
                      disabled={deletingId === subject.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(subject.createdAt).toLocaleDateString()}
                  </p>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/subjects/${subject.id}`}>
                      View Materials
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No subjects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first subject to start organizing your materials.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}