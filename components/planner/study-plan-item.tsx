'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StudyPlan } from '@/types';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface StudyPlanItemProps {
  plan: StudyPlan;
  onToggleComplete?: (id: string) => void;
}

export function StudyPlanItem({ plan, onToggleComplete }: StudyPlanItemProps) {
  return (
    <Card className={`transition-opacity ${plan.completed ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={plan.completed}
            onCheckedChange={() => onToggleComplete?.(plan.id)}
            className="mt-1"
          />
          <div className="flex-1">
            <CardTitle className={`text-base ${plan.completed ? 'line-through' : ''}`}>
              {plan.title}
            </CardTitle>
            {plan.description && (
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(plan.date, 'MMM dd, yyyy')}</span>
          </div>
          {plan.time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{plan.time}</span>
            </div>
          )}
        </div>

        {plan.materials && plan.materials.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>Materials ({plan.materials.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.materials.slice(0, 3).map((material) => (
                <Badge key={material.id} variant="outline" className="text-xs">
                  {material.title}
                </Badge>
              ))}
              {plan.materials.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{plan.materials.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}