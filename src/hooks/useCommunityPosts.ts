import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useCallback, useMemo, useState } from 'react';

// Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message);
  }
  return 'An unexpected error occurred';
};

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
    full_name: string | null;
    username: string | null;
    avatar_url?: string | null;
  } | null;
  pets?: {
    name: string;
    photo_url?: string | null;
  } | null;
}

export interface CreatePostInput {
  content: string;
  pet_id?: string;
  image_url?: string;
}

export const useCommunityPosts = (page = 0, limit = 10) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => ['community-posts', page, limit], [page, limit]);

  const { data: posts = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            *,
            profiles(full_name, username, avatar_url),
            pets(name, photo_url)
          `)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;
        return (data || []) as CommunityPost[];
      } catch (err) {
        console.error('Error fetching community posts:', err);
        throw err;
      }
    },
    enabled: !!user,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: CreatePostInput) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to create posts');
      }

      if (!newPost.content.trim()) {
        throw new Error('Post content cannot be empty');
      }

      try {
        const { data, error } = await supabase
          .from('community_posts')
          .insert({
            ...newPost,
            user_id: user.id,
          })
          .select(`
            *,
            profiles(full_name, username, avatar_url),
            pets(name, photo_url)
          `)
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error creating post:', err);
        throw err;
      }
    },
    onSuccess: (newPost) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: CommunityPost[] | undefined) => {
        return oldData ? [newPost, ...oldData] : [newPost];
      });
      
      // Invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      
      toast({
        title: "Post shared!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sharing post",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Debounced like functionality to prevent rapid clicking
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to like posts');
      }

      if (likingPosts.has(postId)) {
        throw new Error('Please wait before liking again');
      }

      setLikingPosts(prev => new Set(prev).add(postId));

      try {
        // Use maybeSingle to handle case where no like exists
        const { data: existingLike, error: selectError } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (selectError) throw selectError;

        const isLiked = !!existingLike;

        if (isLiked) {
          // Unlike the post
          const { error: deleteError } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;

          // Decrease likes count
          const { error: rpcError } = await supabase.rpc('decrement_likes_count', { post_id: postId });
          if (rpcError) throw rpcError;
        } else {
          // Like the post
          const { error: insertError } = await supabase
            .from('likes')
            .insert({
              post_id: postId,
              user_id: user.id,
            });

          if (insertError) throw insertError;

          // Increase likes count
          const { error: rpcError } = await supabase.rpc('increment_likes_count', { post_id: postId });
          if (rpcError) throw rpcError;
        }

        return !isLiked; // Return new like status
      } catch (err) {
        console.error('Error toggling like:', err);
        throw err;
      } finally {
        setLikingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    onSuccess: (newLikeStatus, postId) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: CommunityPost[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: newLikeStatus 
                  ? post.likes_count + 1 
                  : Math.max(0, post.likes_count - 1)
              }
            : post
        );
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error, postId) => {
      // Remove from liking set on error
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      
      toast({
        title: "Error updating like",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 1,
    retryDelay: 500,
  });

  // Callback functions for better stability
  const createPost = useCallback(async (postData: CreatePostInput) => {
    return createPostMutation.mutateAsync(postData);
  }, [createPostMutation]);

  const likePost = useCallback((postId: string) => {
    if (likingPosts.has(postId)) return;
    likePostMutation.mutate(postId);
  }, [likePostMutation, likingPosts]);

  const refreshPosts = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    posts,
    isLoading,
    error,
    createPost,
    createPostSync: createPostMutation.mutate,
    createPostAsync: createPostMutation.mutateAsync,
    likePost,
    refreshPosts,
    isCreatingPost: createPostMutation.isPending,
    isLiking: likePostMutation.isPending,
    likingPosts: Array.from(likingPosts),
    hasError: !!error,
    errorMessage: error ? getErrorMessage(error) : null,
  };
};