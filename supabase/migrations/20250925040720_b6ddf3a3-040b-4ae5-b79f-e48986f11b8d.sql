-- Add foreign key constraint between community_posts and profiles via user_id
ALTER TABLE public.community_posts 
ADD CONSTRAINT community_posts_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;