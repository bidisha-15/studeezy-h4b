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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Calendar, BookOpen, Copy, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface Member {
  id: string;
  user: User;
  role: string;
}

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

interface GroupMaterial {
  id: string;
  material: Material;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  members: Member[];
  materials: GroupMaterial[];
}

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [materialsDialogOpen, setMaterialsDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupMaterials, setGroupMaterials] = useState<GroupMaterial[]>([]);
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      toast.error('Failed to fetch study groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to create group');

      toast.success('Study group created successfully!');
      setCreateGroupOpen(false);
      setGroupName('');
      setGroupDescription('');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to create study group');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const response = await fetch(`/api/groups/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      if (!response.ok) throw new Error('Invalid or expired code');
      toast.success('Joined group!');
      setJoinGroupOpen(false);
      setJoinCode('');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to join group');
    }
  };

  const handleShowInviteCode = async (groupId: string) => {
    setInviteDialogOpen(true);
    setInviteCode('');
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`);
      if (!response.ok) throw new Error('Failed to fetch invite code');
      const data = await response.json();
      setInviteCode(data.inviteCode);
    } catch {
      setInviteCode('Error');
    }
  };

  const handleShowMaterials = async (groupId: string) => {
    setMaterialsDialogOpen(true);
    setSelectedGroupId(groupId);
    setGroupMaterials([]);
    setUserMaterials([]);
    try {
      const res = await fetch(`/api/groups/${groupId}/materials`);
      if (res.ok) setGroupMaterials(await res.json());
    } catch {}
    try {
      const res = await fetch('/api/materials');
      if (res.ok) setUserMaterials(await res.json());
    } catch {}
  };

  const handleShareMaterial = async (materialId: string) => {
    if (!selectedGroupId) return;
    setShareLoading(true);
    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId }),
      });
      if (!res.ok) throw new Error('Failed to share');
      toast.success('Material shared!');
      const groupRes = await fetch(`/api/groups/${selectedGroupId}/materials`);
      if (groupRes.ok) setGroupMaterials(await groupRes.json());
    } catch {
      toast.error('Failed to share material');
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshareMaterial = async (materialId: string) => {
    if (!selectedGroupId) return;
    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/materials?materialId=${materialId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove material');
      toast.success('Material removed from group');
      const groupRes = await fetch(`/api/groups/${selectedGroupId}/materials`);
      if (groupRes.ok) setGroupMaterials(await groupRes.json());
    } catch {
      toast.error('Failed to remove material');
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1200);
    } catch {}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
          <p className="text-muted-foreground">
            Collaborate with fellow students in organized study groups
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinGroupOpen(true)}>
            Join Group
          </Button>
          <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Study Group</DialogTitle>
                <DialogDescription>
                  Set up a new study group to collaborate with other students.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Describe the purpose of this study group"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateGroupOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Group by Code</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <Input
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setJoinGroupOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Join</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const memberCount = group.members.length;
            const avatars = group.members.slice(0, 3);
            const extra = memberCount - avatars.length;
            return (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {group.name}
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{memberCount} members</span>
                    <BookOpen className="h-4 w-4 ml-2" />
                    <span>{group.materials.length} materials</span>
                  </div>
                  <div className="flex -space-x-2 items-center">
                    {avatars.map((member) => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={member.user.image || ''} alt={member.user.name} />
                        <AvatarFallback className="text-xs">
                          {member.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {extra > 0 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">+{extra}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleShowInviteCode(group.id)}>
                      <Share2 className="h-4 w-4 mr-1" /> Invite
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShowMaterials(group.id)}>
                      <BookOpen className="h-4 w-4 mr-1" /> Materials
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/dashboard/groups/${group.id}`}>View Group</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No study groups yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first study group to start collaborating with other students.
          </p>
          <Button onClick={() => setCreateGroupOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Study Group
          </Button>
        </div>
      )}

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Invite Code</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={inviteCode} readOnly className="w-40" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            {copySuccess && <span className="text-green-600 text-xs">Copied!</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Share this code with others to let them join your group.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={materialsDialogOpen} onOpenChange={setMaterialsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Group Materials</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Shared in Group</h4>
            {groupMaterials.length === 0 ? (
              <p className="text-muted-foreground text-sm">No materials shared yet.</p>
            ) : (
              <div className="space-y-2">
                {groupMaterials.map((groupMaterial) => {
                  const material = groupMaterial.material;
                  return (
                    <div key={groupMaterial.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{material.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {material.subject.name} • {formatFileSize(material.fileSize)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnshareMaterial(material.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium mb-2">Share Your Material</h4>
            {userMaterials.length === 0 ? (
              <p className="text-muted-foreground text-sm">You have no uploaded materials.</p>
            ) : (
              <div className="space-y-2">
                {userMaterials
                  .filter(material => 
                    !groupMaterials.some(gm => gm.material.id === material.id)
                  )
                  .map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{material.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {material.subject.name} • {formatFileSize(material.fileSize)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={shareLoading}
                        onClick={() => handleShareMaterial(material.id)}
                      >
                        Share
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
