import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Utensils, Droplets, Footprints, Heart, Scissors, Pill, Clock, Scale, Thermometer } from "lucide-react";
import { ActivityDetailDialog } from "@/components/ActivityDetailDialog";

const activityTypes = [
  { id: 'meal', label: 'Meal/Feeding', icon: Utensils, color: 'pet-orange' },
  { id: 'water', label: 'Water Intake', icon: Droplets, color: 'pet-blue' },
  { id: 'walk', label: 'Walk/Exercise', icon: Footprints, color: 'pet-green' },
  { id: 'play', label: 'Playtime', icon: Heart, color: 'pet-pink' },
  { id: 'grooming', label: 'Grooming', icon: Scissors, color: 'pet-purple' },
  { id: 'medicine', label: 'Medicine/Supplement', icon: Pill, color: 'destructive' },
  { id: 'sleep', label: 'Sleep/Rest', icon: Clock, color: 'muted' },
  { id: 'weight', label: 'Weight Check', icon: Scale, color: 'accent' },
  { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'destructive' },
];

export function AddActivityDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityLabel, setActivityLabel] = useState<string>("");

  const handleActivitySelect = (activityId: string, label: string) => {
    setSelectedActivity(activityId);
    setActivityLabel(label);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button size="sm" className="btn-secondary h-8">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-inter">Track New Activity</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 p-4">
            {activityTypes.map((activity) => {
              const Icon = activity.icon;
              return (
                <Button
                  key={activity.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
                  onClick={() => handleActivitySelect(activity.id, activity.label)}
                >
                  <Icon className={`h-6 w-6 text-${activity.color}`} />
                  <span className="text-xs text-center font-medium">{activity.label}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {selectedActivity && (
        <ActivityDetailDialog
          activityType={selectedActivity}
          activityLabel={activityLabel}
          open={!!selectedActivity}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedActivity(null);
              setActivityLabel("");
            }
          }}
        />
      )}
    </>
  );
}