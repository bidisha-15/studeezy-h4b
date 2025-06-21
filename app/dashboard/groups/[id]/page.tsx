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
import { 
  BookOpen, 
  Users, 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Plus,
  FileText,
  Calendar,
  Crown,
  UserPlus,
  Share2,
  Eye,
  Download,
  MoreVertical
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  fileUrl: string;
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
  const [materials, setMaterials] = useState<GroupMaterial[]>([]);
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'members'>('overview');

  useEffect(() => {
    if (groupId) fetchAll();
    // eslint-disable-next-line
  }, [groupId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [groupRes, materialsRes, userMaterialsRes] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/materials`),
        fetch(`/api/materials`),
      ]);
      if (groupRes.ok) setGroup(await groupRes.json());
      if (materialsRes.ok) setMaterials(await materialsRes.json());
      if (userMaterialsRes.ok) setUserMaterials(await userMaterialsRes.json());
      
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
      console.error("Failed to copy invite code:", error);
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

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
    return '📁';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <Button asChild className="mt-4">
          <Link href="/dashboard/groups">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
          <Button variant="destructive" onClick={handleLeaveGroup} disabled={leaveLoading}>
            Leave Group
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{group.members.length}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{group.materials.length}</p>
                <p className="text-sm text-muted-foreground">Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatDate(group.createdAt)}</p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{group.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">Creator</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'materials' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('materials')}
        >
          Materials ({group.materials.length})
        </Button>
        <Button
          variant={activeTab === 'members' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('members')}
        >
          Members ({group.members.length})
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Materials
              </CardTitle>
              <CardDescription>
                Latest shared study materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {group.materials.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No materials shared yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setActiveTab('materials')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Share Material
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {group.materials.slice(0, 3).map((groupMaterial) => {
                    const material = groupMaterial.material;
                    return (
                      <div key={material.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="text-2xl">{getFileIcon(material.fileType)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{material.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.subject.name} • {formatFileSize(material.fileSize)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/materials/${material.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                  {group.materials.length > 3 && (
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('materials')}>
                      View All Materials
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Members
              </CardTitle>
              <CardDescription>
                Study partners in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.image || ""} alt={member.user.name} />
                      <AvatarFallback>
                        {member.user.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === 'ADMIN' && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {member.user.id === group.createdBy.id && (
                        <Badge variant="outline" className="text-xs">Creator</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Share Material Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Materials
              </CardTitle>
              <CardDescription>
                Share your study materials with the group
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userMaterials.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You have no materials to share</p>
                  <Button asChild>
                    <Link href="/dashboard/materials">
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Materials
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userMaterials.map((material) => {
                    const isShared = materials.some((g) => g.material.id === material.id);
                    return (
                      <Card key={material.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-2xl">{getFileIcon(material.fileType)}</div>
                            {isShared && (
                              <Badge variant="secondary" className="text-xs">
                                Shared
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-sm line-clamp-2">{material.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: material.subject.color }}
                              />
                              <span>{material.subject.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>{formatFileSize(material.fileSize)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(material.uploadedAt)}</span>
                            </div>
                            {material.materialTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {material.materialTags.slice(0, 2).map((mt) => (
                                  <Badge key={mt.tag.name} variant="outline" className="text-xs">
                                    {mt.tag.name}
                                  </Badge>
                                ))}
                                {material.materialTags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{material.materialTags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              asChild
                            >
                              <Link href={`/dashboard/materials/${material.id}`}>
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </Link>
                            </Button>
                            {!isShared ? (
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  setSelectedMaterialId(material.id);
                                  setShareDialogOpen(true);
                                }}
                              >
                                <Share2 className="mr-1 h-3 w-3" />
                                Share
                              </Button>
                            ) : (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleUnshareMaterial(material.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Unshare
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shared Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Shared Materials ({group.materials.length})
              </CardTitle>
              <CardDescription>
                Materials shared by group members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {group.materials.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No materials shared yet</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.materials.map((groupMaterial) => {
                    const material = groupMaterial.material;
                    const isOwner = material.userId === currentUser?.id;
                    
                    return (
                      <Card key={material.id} className="hover:shadow-md transition-shadow group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-2xl">{getFileIcon(material.fileType)}</div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/materials/${material.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Material
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={material.fileUrl} download={material.fileName}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </a>
                                </DropdownMenuItem>
                                {isOwner && (
                                  <DropdownMenuItem 
                                    onClick={() => handleUnshareMaterial(material.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove from Group
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-sm line-clamp-2">{material.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: material.subject.color }}
                              />
                              <span>{material.subject.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>{formatFileSize(material.fileSize)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(material.uploadedAt)}</span>
                            </div>
                            {material.materialTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {material.materialTags.slice(0, 2).map((mt) => (
                                  <Badge key={mt.tag.name} variant="outline" className="text-xs">
                                    {mt.tag.name}
                                  </Badge>
                                ))}
                                {material.materialTags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{material.materialTags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-4"
                            asChild
                          >
                            <Link href={`/dashboard/materials/${material.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Material
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Members ({group.members.length})
            </CardTitle>
            <CardDescription>
              Manage group members and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.members.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.user.image || ""} alt={member.user.name} />
                        <AvatarFallback>
                          {member.user.name.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {member.role === 'ADMIN' && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {member.user.id === group.createdBy.id && (
                            <Badge variant="outline" className="text-xs">Creator</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Joined {formatDate(member.joinedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
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
              <Button onClick={handleShareMaterial} disabled={!selectedMaterialId || shareLoading}>
                {shareLoading ? 'Sharing...' : 'Share'}
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
              <Input value={group.inviteCode} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={handleCopyInviteCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this invite code with your study partners. Anyone with this code can join your group.
            </p>
            {copySuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Copy className="h-4 w-4" />
                Invite code copied to clipboard!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 