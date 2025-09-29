import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Camera, Plus, Upload } from "lucide-react";
import { usePets } from "@/hooks/usePets";
import { toast } from "@/hooks/use-toast";

const petSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(50, "Name must be less than 50 characters"),
  breed: z.string().optional(),
  age: z.number().min(0, "Age must be positive").max(30, "Age must be realistic").optional(),
  weight: z.number().min(0, "Weight must be positive").max(200, "Weight must be realistic").optional(),
  health_notes: z.string().max(500, "Health notes must be less than 500 characters").optional(),
});

type PetFormData = z.infer<typeof petSchema>;

interface AddPetDialogProps {
  children?: React.ReactNode;
}

export function AddPetDialog({ children }: AddPetDialogProps) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { createPet, isCreating } = usePets();

  const form = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      breed: "",
      age: undefined,
      weight: undefined,
      health_notes: "",
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const onSubmit = async (data: PetFormData) => {
    try {
      await createPet({
        name: data.name,
        breed: data.breed || null,
        age: data.age || null,
        weight: data.weight || null,
        health_notes: data.health_notes || null,
      });
      
      toast({
        title: "Pet added successfully!",
        description: `${data.name} has been added to your pets.`,
      });
      
      form.reset();
      setPhoto(null);
      setPhotoPreview(null);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to add pet",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="btn-secondary">
            <Plus className="h-4 w-4 mr-1" />
            Add Pet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-inter">Add New Pet</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Pet Photo</Label>
              {photoPreview ? (
                <Card className="p-4">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Pet preview"
                      className="w-full h-40 object-cover rounded-lg"
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
                <Card className="p-8 border-dashed border-2 hover:border-primary/50 transition-colors">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="flex gap-2">
                        <Camera className="h-8 w-8" />
                        <Upload className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium">Upload pet photo</p>
                      <p className="text-xs">Click to browse or drag & drop</p>
                      <p className="text-xs">Max 5MB</p>
                    </div>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </Card>
              )}
            </div>

            {/* Pet Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your pet's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Breed */}
            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breed</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Golden Retriever, Persian Cat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Age and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="25.5"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Health Notes */}
            <FormField
              control={form.control}
              name="health_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any allergies, medical conditions, or special care instructions..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex-1 btn-primary"
              >
                {isCreating ? "Adding..." : "Add Pet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}