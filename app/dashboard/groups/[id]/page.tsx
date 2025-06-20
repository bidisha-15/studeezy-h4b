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
import { BookOpen, Users, ArrowLeft, Copy } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [userMaterials, setUserMaterials] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

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

  const handleShareMaterial = async (materialId: string) => {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      if (!res.ok) throw new Error("Failed to share");
      toast.success("Material shared!");
      fetchAll();
    } catch {
      toast.error("Failed to share material");
    } finally {
      setShareLoading(false);
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
              <Users className="h-5 w-5" /> Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {members.map((member) => (
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
              <BookOpen className="h-5 w-5" /> Shared Materials ({materials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <p className="text-muted-foreground text-sm">No materials shared yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {materials.map((mat) => (
                  <li key={mat.id} className="text-sm">{mat.title}</li>
                ))}
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
                      disabled={shareLoading || materials.some((g) => g.id === mat.id)}
                      onClick={() => handleShareMaterial(mat.id)}
                    >
                      Share
                    </Button>
                    {materials.some((g) => g.id === mat.id) && (
                      <span className="text-xs text-green-600">Shared</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

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
      </div>
    </DashboardLayout>
  );
} 