import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface HealthLog {
  id: string;
  pet_id: string;
  activity_type: string;
  notes?: string;
  completed: boolean;
  logged_at: string;
  created_at: string;
}

export const useHealthLogs = (petId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthLogs = [], isLoading, error } = useQuery({
    queryKey: ['health-logs', user?.id, petId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id);

      if (petId) {
        query = query.eq('pet_id', petId);
      }

      const { data, error } = await query.order('logged_at', { ascending: false });

      if (error) throw error;
      return data as HealthLog[];
    },
    enabled: !!user?.id,
  });

  const createHealthLogMutation = useMutation({
    mutationFn: async (newLog: Omit<HealthLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('health_logs')
        .insert({
          ...newLog,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
      toast({
        title: "Activity logged!",
        description: "Health activity has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateHealthLogMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HealthLog> & { id: string }) => {
      const { data, error } = await supabase
        .from('health_logs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActivityMutation = useMutation({
    mutationFn: async (logId: string) => {
      const log = healthLogs.find(l => l.id === logId);
      if (!log) throw new Error('Activity not found');

      const { data, error } = await supabase
        .from('health_logs')
        .update({ completed: !log.completed })
        .eq('id', logId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    healthLogs,
    isLoading,
    error,
    createHealthLog: createHealthLogMutation.mutate,
    updateHealthLog: updateHealthLogMutation.mutate,
    toggleActivity: toggleActivityMutation.mutate,
    isCreating: createHealthLogMutation.isPending,
    isUpdating: updateHealthLogMutation.isPending,
    isToggling: toggleActivityMutation.isPending,
  };
};