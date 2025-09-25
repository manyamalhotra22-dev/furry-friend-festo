import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useCallback, useMemo } from 'react';

// Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as any).message);
  }
  return 'An unexpected error occurred';
};

export interface Pet {
  id: string;
  name: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  photo_url?: string | null;
  health_notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string; // Make explicit for type safety
}

export interface CreatePetInput {
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_notes?: string;
}

export const usePets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => ['pets', user?.id], [user?.id]);

  const { data: pets = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as Pet[];
      } catch (err) {
        console.error('Error fetching pets:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createPetMutation = useMutation({
    mutationFn: async (newPet: CreatePetInput) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to create pets');
      }

      if (!newPet.name.trim()) {
        throw new Error('Pet name cannot be empty');
      }

      try {
        const { data, error } = await supabase
          .from('pets')
          .insert({
            ...newPet,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data as Pet;
      } catch (err) {
        console.error('Error creating pet:', err);
        throw err;
      }
    },
    onSuccess: (newPet) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: Pet[] | undefined) => {
        return oldData ? [newPet, ...oldData] : [newPet];
      });
      
      // Invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      
      toast({
        title: "Pet added successfully!",
        description: "Your new family member has been added to your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding pet",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: 1000,
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pet> & { id: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to update pets');
      }

      if (!id) {
        throw new Error('Pet ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('pets')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data as Pet;
      } catch (err) {
        console.error('Error updating pet:', err);
        throw err;
      }
    },
    onSuccess: (updatedPet) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: Pet[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(pet => 
          pet.id === updatedPet.id ? updatedPet : pet
        );
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      
      toast({
        title: "Pet updated successfully!",
        description: "Your pet's information has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating pet",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: 1000,
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to delete pets');
      }

      if (!petId) {
        throw new Error('Pet ID is required');
      }

      try {
        const { error } = await supabase
          .from('pets')
          .delete()
          .eq('id', petId)
          .eq('user_id', user.id);

        if (error) throw error;
        return petId;
      } catch (err) {
        console.error('Error deleting pet:', err);
        throw err;
      }
    },
    onSuccess: (deletedPetId) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: Pet[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.filter(pet => pet.id !== deletedPetId);
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      
      toast({
        title: "Pet removed",
        description: "The pet has been removed from your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing pet",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Callback functions for better stability
  const createPet = useCallback(async (petData: CreatePetInput) => {
    return createPetMutation.mutateAsync(petData);
  }, [createPetMutation]);

  const updatePet = useCallback(async (petData: Partial<Pet> & { id: string }) => {
    return updatePetMutation.mutateAsync(petData);
  }, [updatePetMutation]);

  const deletePet = useCallback((petId: string) => {
    deletePetMutation.mutate(petId);
  }, [deletePetMutation]);

  const refreshPets = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    pets,
    isLoading,
    error,
    createPet,
    createPetSync: createPetMutation.mutate,
    createPetAsync: createPetMutation.mutateAsync,
    updatePet,
    updatePetSync: updatePetMutation.mutate,
    updatePetAsync: updatePetMutation.mutateAsync,
    deletePet,
    refreshPets,
    isCreating: createPetMutation.isPending,
    isUpdating: updatePetMutation.isPending,
    isDeleting: deletePetMutation.isPending,
    hasError: !!error,
    errorMessage: error ? getErrorMessage(error) : null,
  };
};