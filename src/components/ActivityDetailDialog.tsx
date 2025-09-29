import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Camera, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useHealthLogs } from "@/hooks/useHealthLogs";
import { usePets } from "@/hooks/usePets";
import { toast } from "@/hooks/use-toast";

const activitySchema = z.object({
  activity_type: z.string().min(1, "Activity type is required"),
  pet_id: z.string().min(1, "Please select a pet"),
  logged_at: z.date(),
  quantity: z.number().min(0, "Quantity must be positive").optional(),
  duration_minutes: z.number().min(0, "Duration must be positive").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityDetailDialogProps {
  activityType: string;
  activityLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const activityUnits: Record<string, { quantityLabel?: string; unit?: string; showDuration?: boolean }> = {
  meal: { quantityLabel: "Amount", unit: "cups/grams", showDuration: false },
  water: { quantityLabel: "Amount", unit: "ml", showDuration: false },
  walk: { showDuration: true },
  play: { showDuration: true },
  grooming: { showDuration: true },
  medicine: { quantityLabel: "Dosage", unit: "mg/pills" },
  sleep: { showDuration: true },
  weight: { quantityLabel: "Weight", unit: "kg" },
  temperature: { quantityLabel: "Temperature", unit: "°C" },
};

const moodOptions = [
  { value: "happy", label: "😊 Happy" },
  { value: "playful", label: "🎾 Playful" },
  { value: "calm", label: "😌 Calm" },
  { value: "tired", label: "😴 Tired" },
  { value: "anxious", label: "😰 Anxious" },
  { value: "sick", label: "🤒 Not feeling well" },
];

export function ActivityDetailDialog({ activityType, activityLabel, open, onOpenChange }: ActivityDetailDialogProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { createHealthLog, isCreating } = useHealthLogs();
  const { pets } = usePets();

  const config = activityUnits[activityType] || {};

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: activityType,
      pet_id: "",
      logged_at: new Date(),
      quantity: undefined,
      duration_minutes: undefined,
      notes: "",
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (data: ActivityFormData) => {
    try {
      let notes = data.notes || "";
      
      // Add quantity/duration info to notes
      if (data.quantity && config.quantityLabel) {
        notes += `\n${config.quantityLabel}: ${data.quantity}${config.unit ? ` ${config.unit}` : ""}`;
      }
      if (data.duration_minutes && config.showDuration) {
        notes += `\nDuration: ${data.duration_minutes} minutes`;
      }

      await createHealthLog({
        activity_type: data.activity_type,
        pet_id: data.pet_id,
        logged_at: data.logged_at.toISOString(),
        notes: notes.trim() || null,
      });
      
      toast({
        title: "Activity logged!",
        description: `${activityLabel} has been recorded for your pet.`,
      });
      
      form.reset();
      setPhoto(null);
      setPhotoPreview(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to log activity",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-inter">Log {activityLabel}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pet Selection */}
            <FormField
              control={form.control}
              name="pet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Pet *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your pet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pets?.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} {pet.breed && `(${pet.breed})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time */}
            <FormField
              control={form.control}
              name="logged_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP 'at' p")
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            if (field.value && e.target.value) {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(field.value);
                              newDate.setHours(parseInt(hours), parseInt(minutes));
                              field.onChange(newDate);
                            }
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity Input (if applicable) */}
            {config.quantityLabel && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{config.quantityLabel} {config.unit && `(${config.unit})`}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter amount"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Duration Input (if applicable) */}
            {config.showDuration && (
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo (optional)</label>
              {photoPreview ? (
                <Card className="p-4">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Activity photo"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removePhoto}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 border-dashed border-2 hover:border-primary/50 transition-colors">
                  <label htmlFor="activity-photo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="flex gap-2">
                        <Camera className="h-6 w-6" />
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm">Add a photo</p>
                    </div>
                  </label>
                  <input
                    id="activity-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </Card>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details about this activity..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex-1 btn-primary"
              >
                {isCreating ? "Logging..." : "Log Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}