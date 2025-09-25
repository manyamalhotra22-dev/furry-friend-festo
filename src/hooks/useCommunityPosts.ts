import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CommunityPost {
  id: string;
  user_id: string;
  pet_id?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url?: string;
  };
  pets?: {
    name: string;
    photo_url?: string;
  };
}

export const useCommunityPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey(full_name, username, avatar_url),
          pets(name, photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommunityPost[];
    },
    enabled: !!user,
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: { content: string; pet_id?: string; image_url?: string }) => {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...newPost,
          user_id: user?.id,
        })
        .select(`
          *,
          profiles!community_posts_user_id_fkey(full_name, username, avatar_url),
          pets(name, photo_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast({
        title: "Post shared!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sharing post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingLike) {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);

        // Decrease likes count
        const { error } = await supabase.rpc('decrement_likes_count', { post_id: postId });
        if (error) throw error;
      } else {
        // Like the post
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user?.id,
          });

        // Increase likes count
        const { error } = await supabase.rpc('increment_likes_count', { post_id: postId });
        if (error) throw error;
      }

      return !existingLike; // Return new like status
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating like",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost: createPostMutation.mutate,
    likePost: likePostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    isLiking: likePostMutation.isPending,
  };
};