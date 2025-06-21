'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Trash2, Edit, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
];

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const router = useRouter();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      toast.error("Enter a tag name");
      return
    };

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tagName,
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to create tag");
        throw new Error('Failed to create tag');
      }

      const newTag = await response.json();
      setTags(prev => [...prev, newTag]);
      toast.success('Tag created successfully!');
      setCreateTagOpen(false);
      setTagName('');
      setSelectedColor(PRESET_COLORS[0]);
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
      try {
        const response = await axios.delete(`/api/tags/${id}`);

        if (response.status != 200) throw new Error('Failed to delete tag');

        setTags(prev => prev.filter(tag => tag.id !== id));
        toast.success('Tag deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete tag');
      }
  };
  

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
            <p className="text-muted-foreground">
              Create and manage tags to label your study materials
            </p>
          </div>
          <Dialog open={createTagOpen} onOpenChange={setCreateTagOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tag</DialogTitle>
                <DialogDescription>
                  Create a new tag to label and organize your study materials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tag Name</label>
                  <Input
                    placeholder="e.g., Important, Exam Prep, Assignment"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-foreground' : 'border-transparent'
                          }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateTagOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Tag</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tags.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tags.map((tag) => (
              <Card key={tag.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                router.push(`/dashboard/tags/${tag.id}`)
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" style={{ color: tag.color }} />
                      <CardTitle className="text-base">{tag.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color,
                      borderColor: tag.color + '40',
                    }}
                  >
                    {tag.name}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Tag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first tag to start labeling your study materials.
            </p>
            <Button onClick={() => setCreateTagOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Tag
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}