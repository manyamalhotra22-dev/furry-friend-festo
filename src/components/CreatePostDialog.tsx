import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Camera, Upload, MessageSquarePlus, X } from "lucide-react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { usePets } from "@/hooks/usePets";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(1000, "Post must be less than 1000 characters"),
  pet_id: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface CreatePostDialogProps {
  children?: React.ReactNode;
}

export function CreatePostDialog({ children }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { createPost, isCreatingPost } = useCommunityPosts();
  const { pets } = usePets();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      pet_id: "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      await createPost({
        content: data.content,
        pet_id: data.pet_id || null,
        image_url: null, // TODO: Add image upload to storage when ready
      });
      
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      
      form.reset();
      setImage(null);
      setImagePreview(null);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to create post",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const contentLength = form.watch("content")?.length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-dashed border-2">
            <div className="flex items-center gap-3">
              <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
              <p className="text-muted-foreground">Share your pet's moment...</p>
            </div>
          </Card>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-inter">Create New Post</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pet Selection */}
            <FormField
              control={form.control}
              name="pet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag a Pet (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pet to feature" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No pet selected</SelectItem>
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

            {/* Post Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's on your mind? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share a cute moment, ask for advice, or tell us about your pet's day..."
                      className="min-h-[120px] resize-none"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className={cn(
                      "text-xs",
                      contentLength > 900 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {contentLength}/1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Photo (optional)</label>
              {imagePreview ? (
                <Card className="p-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Post preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 border-dashed border-2 hover:border-primary/50 transition-colors">
                  <label htmlFor="post-image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="flex gap-2">
                        <Camera className="h-8 w-8" />
                        <Upload className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium">Add a photo to your post</p>
                      <p className="text-xs">Click to browse or drag & drop</p>
                      <p className="text-xs">Max 10MB • JPG, PNG, WEBP</p>
                    </div>
                  </label>
                  <input
                    id="post-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </Card>
              )}
            </div>

            {/* Tips */}
            <Card className="p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tips:</strong> Share photos, ask questions, celebrate milestones, or seek advice from fellow pet parents!
              </p>
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
                disabled={isCreatingPost || contentLength === 0}
                className="flex-1 btn-primary"
              >
                {isCreatingPost ? "Posting..." : "Share Post"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}