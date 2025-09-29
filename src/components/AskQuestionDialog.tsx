import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HelpCircle, X, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const questionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface AskQuestionDialogProps {
  children?: React.ReactNode;
}

const categories = [
  "Health & Wellness",
  "Training & Behavior",
  "Nutrition & Diet",
  "Grooming & Care",
  "Emergency & First Aid",
  "Breeding & Pregnancy",
  "Exercise & Activities",
  "Travel & Transport",
  "General Care",
  "Other"
];

const suggestedTags = [
  "puppy", "kitten", "senior", "diet", "exercise", "training", "health", 
  "vet", "emergency", "behavior", "grooming", "travel", "medication", 
  "vaccination", "dental", "weight", "anxiety", "aggressive", "playful"
];

export function AskQuestionDialog({ children }: AskQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
    },
  });

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag) && selectedTags.length < 5) {
      const updatedTags = [...selectedTags, trimmedTag];
      setSelectedTags(updatedTags);
      form.setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    try {
      // TODO: Submit question to community/database
      console.log('Submitting question:', data);
      
      toast({
        title: "Question posted!",
        description: "Your question has been shared with the community. You'll be notified when someone answers.",
      });
      
      form.reset();
      setSelectedTags([]);
      setNewTag("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to post question",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="btn-primary">
            <HelpCircle className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-inter">Ask the Community</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Question Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Title *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., My dog won't eat his food, what should I do?"
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Be specific and clear - this helps others find and answer your question
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={field.value === category ? "default" : "outline"}
                        size="sm"
                        className="h-auto p-3 text-xs"
                        onClick={() => field.onChange(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide more details about your question:&#10;- What's the situation?&#10;- What have you tried already?&#10;- Any relevant background information?&#10;- How urgent is this?"
                      className="min-h-[120px] resize-none"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Include as much relevant detail as possible
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/1000
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-3">
              <FormLabel>Tags (optional, max 5)</FormLabel>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              {selectedTags.length < 5 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}

              {/* Suggested Tags */}
              {selectedTags.length < 5 && (
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags
                      .filter(tag => !selectedTags.includes(tag))
                      .slice(0, 10)
                      .map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addTag(tag)}
                        >
                          +{tag}
                        </Button>
                      ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Tips */}
            <Card className="p-4 bg-muted/30">
              <h4 className="font-medium mb-2">💡 Tips for getting great answers:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be specific about your pet's breed, age, and health status</li>
                <li>• Include photos if they help explain your question</li>
                <li>• Mention what you've already tried</li>
                <li>• Use relevant tags so the right experts see your question</li>
                <li>• For emergencies, contact your vet immediately</li>
              </ul>
            </Card>

            {/* Submit Buttons */}
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
                className="flex-1 btn-primary"
              >
                Post Question
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}