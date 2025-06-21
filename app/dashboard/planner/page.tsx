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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus, BookOpen, Clock, Trash2, Sparkles, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Subject {
  id: string;
  name: string;
}

interface Material {
  id: string;
  title: string;
  fileType: string;
  subject: Subject;
}

interface StudyPlan {
  id: string;
  title: string;
  date: Date;
  materials: {
    material: Material;
  }[];
}

interface AiStudyPlan {
    id: string;
    subject: Subject;
    timeFrame: string;
    plan: {
      steps: { materialId: string; title: string; goal: string }[];
      summary: string;
    };
    createdAt: string;
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [aiPlans, setAiPlans] = useState<AiStudyPlan[]>([]);

  const [loading, setLoading] = useState(true);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [aiPlanOpen, setAiPlanOpen] = useState(false);

  const [newPlan, setNewPlan] = useState({
    title: '',
    date: new Date(),
    materialIds: [] as string[],
  });

  const [aiPlanRequest, setAiPlanRequest] = useState({
    subjectId: '',
    materialIds: [] as string[],
    timeFrame: '1 week',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [plansRes, materialsRes, subjectsRes] = await Promise.all([
        fetch('/api/planner'),
        fetch('/api/materials'),
        fetch('/api/subjects'),
      ]);
      
      if (plansRes.ok) {
        const data = await plansRes.json();
        const patchedPlans = data.map((plan: any) => ({
          ...plan,
          materials: Array.isArray(plan.linkedMaterials) ? plan.linkedMaterials : [],
        }));
        setPlans(patchedPlans);
      }
      if (materialsRes.ok) setMaterials(await materialsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());

    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim() || newPlan.materialIds.length === 0) {
        toast.error('Please provide a title and select at least one material.');
        return;
    };

    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan),
      });

      if (!response.ok) throw new Error('Failed to create plan');

      toast.success('Study plan created successfully!');
      setCreatePlanOpen(false);
      setNewPlan({ title: '', date: new Date(), materialIds: [] });
      fetchAll();
    } catch (error) {
      toast.error('Failed to create study plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/planner/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete plan');

      toast.success('Study plan deleted successfully!');
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete study plan');
    }
  };

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPlanRequest.subjectId || aiPlanRequest.materialIds.length === 0) {
        toast.error('Please select a subject and at least one material.');
        return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/planner/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPlanRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      toast.success('AI study plan generated successfully!');
      setAiPlanOpen(false);
      setAiPlanRequest({ subjectId: '', materialIds: [], timeFrame: '1 week' });
      // You might want to fetch and display AI plans separately
      // fetchAiPlans(); 
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate study plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredMaterialsForAi = materials.filter(m => m.subject.id === aiPlanRequest.subjectId);

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
            <p className="text-muted-foreground">
              Organize your study materials and create a structured learning plan
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={aiPlanOpen} onOpenChange={setAiPlanOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Generate Plan
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate AI Study Plan</DialogTitle>
                        <DialogDescription>Let AI create a structured plan for you based on your materials.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGenerateAiPlan} className="space-y-4">
                        <div>
                            <Label>Subject</Label>
                            <Select
                                onValueChange={(value) => setAiPlanRequest({ ...aiPlanRequest, subjectId: value, materialIds: [] })}
                                value={aiPlanRequest.subjectId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(subject => (
                                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {aiPlanRequest.subjectId && (
                            <div>
                                <Label>Materials</Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                                    {filteredMaterialsForAi.length > 0 ? filteredMaterialsForAi.map(material => (
                                        <div key={material.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`ai-${material.id}`}
                                                checked={aiPlanRequest.materialIds.includes(material.id)}
                                                onChange={(e) => {
                                                    const materialIds = e.target.checked
                                                        ? [...aiPlanRequest.materialIds, material.id]
                                                        : aiPlanRequest.materialIds.filter((id) => id !== material.id);
                                                    setAiPlanRequest({ ...aiPlanRequest, materialIds });
                                                }}
                                            />
                                            <label htmlFor={`ai-${material.id}`} className="text-sm">{material.title}</label>
                                        </div>
                                    )) : <p className="text-sm text-muted-foreground">No materials for this subject.</p>}
                                </div>
                            </div>
                        )}
                        <div>
                            <Label>Time Frame</Label>
                            <Select
                                onValueChange={(value) => setAiPlanRequest({ ...aiPlanRequest, timeFrame: value })}
                                defaultValue="1 week"
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1 week">1 Week</SelectItem>
                                    <SelectItem value="2 weeks">2 Weeks</SelectItem>
                                    <SelectItem value="1 month">1 Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAiPlanOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isGenerating}>
                                {isGenerating ? 'Generating...' : 'Generate Plan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Manual Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Plan</DialogTitle>
                  <DialogDescription>
                    Schedule your study materials for specific dates.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Enter plan title"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPlan.date ? format(newPlan.date, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newPlan.date}
                          onSelect={(date) => date && setNewPlan({ ...newPlan, date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Materials</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {materials.map((material) => (
                        <div key={material.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={material.id}
                            checked={newPlan.materialIds.includes(material.id)}
                            onChange={(e) => {
                              const materialIds = e.target.checked
                                ? [...newPlan.materialIds, material.id]
                                : newPlan.materialIds.filter((id) => id !== material.id);
                              setNewPlan({ ...newPlan, materialIds });
                            }}
                          />
                          <label htmlFor={material.id} className="text-sm">
                            {material.title} ({material.subject.name})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreatePlanOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Plan</Button>
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
        ) : plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(plan.date), 'PPP')}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{plan.materials.length} materials</span>
                    </div>
                    <div className="space-y-1">
                      {plan.materials.map(({ material }) => (
                        <div
                          key={material.id}
                          className="text-sm flex items-center gap-2"
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{material.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {material.subject.name}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No study plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first study plan to organize your learning schedule.
            </p>
            <Button onClick={() => setCreatePlanOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Study Plan
            </Button>
          </div>
        )}
      </div>
    
  );
}
