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
import { CalendarIcon, Plus, BookOpen, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Material {
  id: string;
  title: string;
  fileType: string;
  subject: {
    name: string;
  };
}

interface StudyPlan {
  id: string;
  title: string;
  date: Date;
  materials: {
    material: Material;
  }[];
  linkedMaterials?: unknown[];
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    date: new Date(),
    materialIds: [] as string[],
  });

  useEffect(() => {
    fetchPlans();
    fetchMaterials();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/planner');
      if (!response.ok) throw new Error('Failed to fetch plans');
      const data = await response.json();
      
      const patchedPlans = data.map((plan: StudyPlan) => ({
        ...plan,
        materials: Array.isArray(plan.linkedMaterials)
          ? plan.linkedMaterials
          : [],
      }));
      setPlans(patchedPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to fetch study plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      toast.error('Failed to fetch materials');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim()) return;

    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlan),
      });

      if (!response.ok) throw new Error('Failed to create plan');

      toast.success('Study plan created successfully!');
      setCreatePlanOpen(false);
      setNewPlan({
        title: '',
        date: new Date(),
        materialIds: [],
      });
      fetchPlans();
    } catch (error) {
      console.error('Failed to create plan:', error);
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
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error('Failed to delete study plan');
    }
  };

  return (
    
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
            <p className="text-muted-foreground">
              Organize your study materials and create a structured learning plan
            </p>
          </div>
          <Dialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
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
                  <div className="space-y-2">
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
