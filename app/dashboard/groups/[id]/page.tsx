"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Users, ArrowLeft, Copy, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface Member {
  id: string;
  user: User;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  userId: string;
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

interface GroupMaterial {
  id: string;
  material: Material;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  inviteCode: string;
  createdBy: User;
  members: Member[];
  materials: GroupMaterial[];
  currentUserId?: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [materials, setMaterials] = useState<GroupMaterial[]>([]);
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (groupId) fetchAll();
    // eslint-disable-next-line
  }, [groupId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [groupRes, membersRes, materialsRes, userMaterialsRes, inviteRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/members`),
        fetch(`/api/groups/${groupId}/materials`),
        fetch(`/api/materials`),
        fetch(`/api/groups/${groupId}/invite`),
      ]);
      if (groupRes.ok) setGroup(await groupRes.json());
      if (membersRes.ok) setMembers(await membersRes.json());
      if (materialsRes.ok) setMaterials(await materialsRes.json());
      if (userMaterialsRes.ok) setUserMaterials(await userMaterialsRes.json());
      if (inviteRes.ok) setInviteCode((await inviteRes.json()).inviteCode);
      
      // Find current user in members
      const groupData = await groupRes.json();
      if (groupData) {
        const currentMember = groupData.members.find((member: Member) => 
          member.user.id === groupData.currentUserId
        );
        if (currentMember) {
          setCurrentUser(currentMember.user);
        }
      }
    } catch {
      toast.error("Failed to load group data");
    } finally {
      setLoading(false);
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

  const handleShareMaterial = async () => {
    if (!selectedMaterialId) return;

    setShareLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: selectedMaterialId }),
      });
      if (!res.ok) throw new Error("Failed to share");
      toast.success("Material shared!");
      setShareDialogOpen(false);
      setSelectedMaterialId("");
      fetchAll();
    } catch {
      toast.error("Failed to share material");
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshareMaterial = async (materialId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/materials?materialId=${materialId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove material");
      toast.success("Material removed from group");
      fetchAll();
    } catch {
      toast.error("Failed to remove material");
    }
  };

  const handleLeaveGroup = async () => {
    setLeaveLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/leave`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to leave group");
      toast.success("Left group");
      router.push("/dashboard/groups");
    } catch {
      toast.error("Failed to leave group");
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!group?.inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      toast.success("Invite code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy invite code");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  if (!group) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Group not found</h1>
          <Button asChild className="mt-4">
            <Link href="/dashboard/groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = group.members.find(member => 
    member.user.id === currentUser?.id
  )?.role === "ADMIN";

  const isCreator = group.createdBy.id === currentUser?.id;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex-1">{group.name}</h1>
          <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
            <Copy className="h-4 w-4 mr-1" /> Invite Code
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLeaveGroup} disabled={leaveLoading}>
            Leave Group
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">{group.description}</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Members ({group.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.image || ""} alt={member.user.name} />
                  <AvatarFallback className="text-xs">
                    {member.user.name.split(" ").map((n: string) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.user.name}</span>
                <span className="text-xs text-muted-foreground">{member.role}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Shared Materials ({group.materials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.materials.length === 0 ? (
              <p className="text-muted-foreground text-sm">No materials shared yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {group.materials.map((groupMaterial) => {
                  const material = groupMaterial.material;
                  const isOwner = material.userId === currentUser?.id;
                  
                  return (
                    <li key={material.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span>{material.title}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{material.subject.name}</span>
                          <span>•</span>
                          <span>{formatFileSize(material.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(material.uploadedAt)}</span>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleUnshareMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share Your Material</CardTitle>
          </CardHeader>
          <CardContent>
            {userMaterials.length === 0 ? (
              <p className="text-muted-foreground text-sm">You have no uploaded materials.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {userMaterials.map((mat) => (
                  <li key={mat.id} className="flex items-center gap-2">
                    <span>{mat.title}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={shareLoading || materials.some((g) => g.material.id === mat.id)}
                      onClick={() => {
                        setSelectedMaterialId(mat.id);
                        setShareDialogOpen(true);
                      }}
                    >
                      Share
                    </Button>
                    {materials.some((g) => g.material.id === mat.id) && (
                      <span className="text-xs text-green-600">Shared</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Group Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Created by</p>
                <p className="text-muted-foreground">{group.createdBy.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Created on</p>
                <p className="text-muted-foreground">{formatDate(group.createdAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Invite Code</p>
              <div className="flex items-center gap-2 mt-1">
                <Input value={group.inviteCode} readOnly className="w-40" />
                <Button variant="outline" size="icon" onClick={handleCopyInviteCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                {copySuccess && <span className="text-green-600 text-xs">Copied!</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a material" />
                </SelectTrigger>
                <SelectContent>
                  {userMaterials
                    .filter(material => 
                      !group.materials.some(gm => gm.material.id === material.id)
                    )
                    .map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleShareMaterial} disabled={!selectedMaterialId}>
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Members</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={group.inviteCode} readOnly />
                <Button variant="outline" size="icon" onClick={handleCopyInviteCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this code can join your group. Share it securely with your study partners.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 