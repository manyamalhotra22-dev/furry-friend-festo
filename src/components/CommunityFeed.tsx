import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Camera,
  Plus,
  Users,
  AlertCircle
} from "lucide-react";

// Remove old interface as we'll use the one from the hook

export function CommunityFeed() {
  const { toast } = useToast();
  const { 
    posts, 
    isLoading, 
    error, 
    likePost, 
    isLiking, 
    likingPosts,
    hasError,
    errorMessage,
    refreshPosts 
  } = useCommunityPosts();

  // Handle errors with user feedback
  useEffect(() => {
    if (hasError && errorMessage) {
      toast({
        title: "Error loading posts",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [hasError, errorMessage, toast]);

  const handleLike = (postId: string) => {
    try {
      likePost(postId);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSpinner size="lg" text="Loading community posts..." className="py-8" />
      </div>
    );
  }

  if (hasError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-12 w-12" />}
        title="Failed to load posts"
        description={errorMessage || "Unable to load community posts. Please try again."}
        action={{
          label: "Retry",
          onClick: refreshPosts
        }}
      />
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No posts yet"
        description="Be the first to share your pet's moment with the community!"
        action={{
          label: "Create First Post",
          onClick: () => {
            // This would open a create post dialog
            toast({
              title: "Coming soon",
              description: "Post creation feature will be available soon!",
            });
          }
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Create Post Card */}
        <Card className="card-warm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                className="flex-1 justify-start text-muted-foreground"
                onClick={() => {
                  toast({
                    title: "Coming soon",
                    description: "Post creation feature will be available soon!",
                  });
                }}
              >
                Share your pet's moment...
              </Button>
              <Button size="icon" className="btn-primary">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => {
          const isPostLiking = likingPosts.includes(post.id);
          const profileName = post.profiles?.full_name || post.profiles?.username || 'Anonymous';
          const petName = post.pets?.name || 'Pet';
          
          return (
            <Card key={post.id} className="card-warm">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.avatar_url || '/placeholder.svg'} />
                      <AvatarFallback>
                        {profileName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{profileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {petName} • {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                {/* Image */}
                {post.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt="Post content"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      disabled={isPostLiking || isLiking}
                      className="flex items-center gap-2 text-muted-foreground hover:text-red-500 disabled:opacity-50"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">
                        {post.likes_count || 0}
                      </span>
                      {isPostLiking && (
                        <LoadingSpinner size="sm" className="ml-1" />
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-muted-foreground"
                      onClick={() => {
                        toast({
                          title: "Coming soon",
                          description: "Comments feature will be available soon!",
                        });
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments_count || 0}</span>
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => {
                      toast({
                        title: "Coming soon", 
                        description: "Share feature will be available soon!",
                      });
                    }}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ErrorBoundary>
  );
}