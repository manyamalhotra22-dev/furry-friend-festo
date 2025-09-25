import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight?: number;
  photo_url?: string;
  health_notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading, error } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!user?.id,
  });

  const createPetMutation = useMutation({
    mutationFn: async (newPet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('pets')
        .insert({
          ...newPet,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast({
        title: "Pet added successfully!",
        description: "Your new family member has been added to your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pet> & { id: string }) => {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast({
        title: "Pet updated successfully!",
        description: "Your pet's information has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast({
        title: "Pet removed",
        description: "The pet has been removed from your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pets,
    isLoading,
    error,
    createPet: createPetMutation.mutate,
    updatePet: updatePetMutation.mutate,
    deletePet: deletePetMutation.mutate,
    isCreating: createPetMutation.isPending,
    isUpdating: updatePetMutation.isPending,
    isDeleting: deletePetMutation.isPending,
  };
};