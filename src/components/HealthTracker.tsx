import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  Droplets, 
  Footprints, 
  Heart, 
  Scissors, 
  Pill,
  Plus,
  CheckCircle2
} from "lucide-react";

interface HealthActivity {
  id: string;
  type: 'meal' | 'water' | 'walk' | 'play' | 'grooming' | 'medicine';
  time: string;
  completed: boolean;
  streak?: number;
}

const activityIcons = {
  meal: Utensils,
  water: Droplets,
  walk: Footprints,
  play: Heart,
  grooming: Scissors,
  medicine: Pill,
};

const activityColors = {
  meal: 'pet-orange',
  water: 'pet-blue',
  walk: 'pet-green',
  play: 'pet-pink',
  grooming: 'pet-purple',
  medicine: 'destructive',
};

export function HealthTracker() {
  const [activities, setActivities] = useState<HealthActivity[]>([
    { id: '1', type: 'meal', time: '8:00 AM', completed: true, streak: 5 },
    { id: '2', type: 'water', time: '10:00 AM', completed: true, streak: 3 },
    { id: '3', type: 'walk', time: '6:00 PM', completed: false },
    { id: '4', type: 'medicine', time: '9:00 PM', completed: false },
  ]);

  const toggleActivity = (id: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    );
  };

  return (
    <Card className="card-warm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-fredoka">Today's Care</span>
          <Button size="sm" className="btn-secondary h-8">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div 
              key={activity.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                activity.completed 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-muted border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`p-2 rounded-full bg-${colorClass}/10`}
                >
                  <Icon className={`h-5 w-5 text-${colorClass}`} />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {activity.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {activity.streak && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.streak} day streak
                  </Badge>
                )}
                <Button
                  variant={activity.completed ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActivity(activity.id)}
                  className={activity.completed ? "bg-success hover:bg-success/90" : ""}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}