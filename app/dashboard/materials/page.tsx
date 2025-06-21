'use client';

import { useState, useEffect } from 'react';

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
import { Label } from '@/components/ui/label';
import { Plus, FileText, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';
import { createWorker } from 'tesseract.js';
// import {converter} from '@/lib/converter';

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  subject: {
    name: string;
  };
  materialTags: {
    tag: {
      name: string;
    };
  }[];
}
interface Subject {
  id: string;
  name: string
}
interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadMaterialOpen, setUploadMaterialOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { edgestore } = useEdgeStore();

  const router = useRouter();

  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
    fetchTags();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };
  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) {
        toast.error('Failed to fetch subjects');
        return;
      }
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  }
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        toast.error('Failed to fetch tags');
        return;
      }
      const data = await response.json();
      setTags(data);
    } catch (error) {
      toast.error('Failed to fetch tags');
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
   
    }
  };
  

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !selectedSubject) {
      toast.error('Please fill in all required fields');
      return;
    }
    // console.log(selectedFile);

    try {
      const uploaded = await edgestore.publicFiles.upload({
        file: selectedFile,
        input: {
          title,
          subjectId: selectedSubject,
          tagIds: [],
        }
      });

      // ocr part finally 
      // const extractedText = await converter(selectedFile);
      // console.log("Extracted text: ",extractedText);

      
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          fileUrl: uploaded.url,
          subjectId: selectedSubject,
          tagIds: selectedTags
        }),
      });
      if (!response.ok) throw new Error('Failed to upload material');

      toast.success('Material uploaded successfully!');
      setUploadMaterialOpen(false);
      setSelectedFile(null);
      setTitle('');
      setSelectedSubject('');
      setSelectedTags([]);
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to upload material');
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete material');

      toast.success('Material deleted successfully!');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      const response = await fetch(material.fileUrl);
      if (!response.ok) throw new Error('Failed to download material');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download material');
    }
  };

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
            <p className="text-muted-foreground">
              Upload and manage your study materials
            </p>
          </div>
          <Dialog open={uploadMaterialOpen} onOpenChange={setUploadMaterialOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Study Material</DialogTitle>
                <DialogDescription>
                  Upload a new study material file.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter material title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>File</Label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt, image/*"
                  />
                </div>
                <div>
                  <Select onValueChange={(value) => setSelectedSubject(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Subjects</SelectLabel>
                        {
                          subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Tags</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <label
                          key={tag.id}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer ${isSelected ? "bg-secondary" : "bg-muted"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                              } else {
                                setSelectedTags([...selectedTags, tag.id]);
                              }
                            }}
                            className="hidden"
                          />
                          <span>{tag.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadMaterialOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Upload</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : materials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/materials/${material.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="line-clamp-1">{material.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {material.subject.name}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {material.materialTags.map(({ tag }) => (
                        <span
                          key={tag.name}
                          className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Uploaded {new Date(material.uploadedAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
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
              Upload your first study material to get started.
            </p>
            <Button onClick={() => setUploadMaterialOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Material
            </Button>
          </div>
        )}
      </div>
    
  );
}
