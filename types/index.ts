export interface Material {
  id: string;
  title: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  completed: boolean;
  materials?: Material[];
} 