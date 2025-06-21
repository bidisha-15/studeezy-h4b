'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEdgeStore } from '@/lib/edgestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  subjectId: string;
  subject: Subject;
  tags: Tag[];
  userId: string;
  uploadedAt: string;
}

const uploadFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  file: z.instanceof(File, { message: 'File is required' }),
  subjectId: z.string().min(1, 'Subject is required'),
  tagIds: z.array(z.string()).optional(),
});

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (material: Omit<Material, 'id' | 'uploadedAt'>) => void;
}

export function FileUploadModal({ open, onOpenChange, onUpload }: FileUploadModalProps) {
  const { edgestore } = useEdgeStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
    fetchTags();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<z.infer<typeof uploadFormSchema>>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
      subjectId: '',
      tagIds: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof uploadFormSchema>) => {
    setIsUploading(true);
    
    try {
      const edgestoreResponse = await edgestore.publicFiles.upload({
        file: values.file,
        input: {}
      });

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          fileName: values.file.name,
          fileType: values.file.type,
          fileSize: values.file.size,
          fileUrl: edgestoreResponse.url,
          subjectId: values.subjectId,
          tagIds: selectedTags,
        }),
      });

      if (!response.ok) throw new Error('Failed to upload material');

      const material = await response.json();
      onUpload(material);
      onOpenChange(false);
      form.reset();
      setSelectedTags([]);
      toast.success('Material uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>
            Upload a PDF, document, or image to add to your study materials.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, DOCX, or images (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              if (!form.getValues('title')) {
                                form.setValue('title', file.name.replace(/\.[^/.]+$/, ''));
                              }
                            }
                          }}
                          {...field}
                          value={undefined}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter material title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Tags (Optional)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                      borderColor: tag.color,
                      color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.id) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}