'use client';

import { useEdgeStore } from '@/lib/edgestore';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function FileUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const { edgestore } = useEdgeStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const res = await edgestore.publicFiles.upload({ 
        file,
        input: {} 
      });
      onUpload(res.url);
      toast.success('Upload successful!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
}