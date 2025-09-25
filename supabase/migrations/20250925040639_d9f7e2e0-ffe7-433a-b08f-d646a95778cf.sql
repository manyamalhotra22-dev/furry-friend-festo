-- Create functions for incrementing and decrementing likes count
CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts 
  SET likes_count = COALESCE(likes_count, 0) + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts 
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;