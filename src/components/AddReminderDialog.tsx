import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Syringe, Scissors, Stethoscope, Heart, Shield, Pill, Calendar, AlertTriangle } from "lucide-react";

const reminderTypes = [
  { id: 'vaccination', label: 'Vaccination', icon: Syringe, color: 'destructive' },
  { id: 'grooming', label: 'Grooming Appointment', icon: Scissors, color: 'pet-purple' },
  { id: 'checkup', label: 'Vet Checkup', icon: Stethoscope, color: 'primary' },
  { id: 'deworming', label: 'Deworming', icon: Shield, color: 'pet-green' },
  { id: 'heartworm', label: 'Heartworm Prevention', icon: Heart, color: 'pet-pink' },
  { id: 'flea-tick', label: 'Flea & Tick Prevention', icon: AlertTriangle, color: 'pet-orange' },
  { id: 'medicine', label: 'Medicine Schedule', icon: Pill, color: 'accent' },
  { id: 'appointment', label: 'General Appointment', icon: Calendar, color: 'muted' },
];

export function AddReminderDialog() {
  const [open, setOpen] = useState(false);

  const handleReminderSelect = (reminderId: string) => {
    console.log('Selected reminder:', reminderId);
    setOpen(false);
    // Here you would typically add the reminder to your state/database
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="btn-secondary h-8">
          <Plus className="h-4 w-4 mr-1" />
          Add Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-inter">Set New Reminder</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          {reminderTypes.map((reminder) => {
            const Icon = reminder.icon;
            return (
              <Button
                key={reminder.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => handleReminderSelect(reminder.id)}
              >
                <Icon className={`h-6 w-6 text-${reminder.color}`} />
                <span className="text-xs text-center font-medium">{reminder.label}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}