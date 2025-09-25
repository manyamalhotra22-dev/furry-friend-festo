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

export interface HealthLog {
  id: string;
  pet_id: string;
  activity_type: string;
  notes?: string | null;
  completed: boolean;
  logged_at: string;
  created_at: string;
  user_id?: string; // Make explicit for type safety
}

export interface CreateHealthLogInput {
  pet_id: string;
  activity_type: string;
  notes?: string;
  completed?: boolean;
  logged_at?: string;
}

export const useHealthLogs = (petId?: string, page = 0, limit = 50) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoize query key to prevent unnecessary refetches
  const queryKey = useMemo(() => ['health-logs', user?.id, petId, page, limit], [user?.id, petId, page, limit]);

  const { data: healthLogs = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        let query = supabase
          .from('health_logs')
          .select('*')
          .eq('user_id', user.id);

        if (petId) {
          query = query.eq('pet_id', petId);
        }

        const { data, error } = await query
          .order('logged_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (error) throw error;
        return (data || []) as HealthLog[];
      } catch (err) {
        console.error('Error fetching health logs:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const createHealthLogMutation = useMutation({
    mutationFn: async (newLog: CreateHealthLogInput) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to create health logs');
      }

      if (!newLog.pet_id) {
        throw new Error('Pet ID is required');
      }

      if (!newLog.activity_type.trim()) {
        throw new Error('Activity type cannot be empty');
      }

      try {
        const { data, error } = await supabase
          .from('health_logs')
          .insert({
            ...newLog,
            user_id: user.id,
            logged_at: newLog.logged_at || new Date().toISOString(),
            completed: newLog.completed ?? false,
          })
          .select()
          .single();

        if (error) throw error;
        return data as HealthLog;
      } catch (err) {
        console.error('Error creating health log:', err);
        throw err;
      }
    },
    onSuccess: (newLog) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: HealthLog[] | undefined) => {
        return oldData ? [newLog, ...oldData] : [newLog];
      });
      
      // Invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
      
      toast({
        title: "Activity logged!",
        description: "Health activity has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging activity",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: 1000,
  });

  const updateHealthLogMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HealthLog> & { id: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to update health logs');
      }

      if (!id) {
        throw new Error('Health log ID is required');
      }

      try {
        const { data, error } = await supabase
          .from('health_logs')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data as HealthLog;
      } catch (err) {
        console.error('Error updating health log:', err);
        throw err;
      }
    },
    onSuccess: (updatedLog) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: HealthLog[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(log => 
          log.id === updatedLog.id ? updatedLog : log
        );
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating activity",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 2,
    retryDelay: 1000,
  });

  const toggleActivityMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to toggle activities');
      }

      if (!logId) {
        throw new Error('Health log ID is required');
      }

      const log = healthLogs.find(l => l.id === logId);
      if (!log) {
        throw new Error('Activity not found in current data');
      }

      try {
        const { data, error } = await supabase
          .from('health_logs')
          .update({ completed: !log.completed })
          .eq('id', logId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data as HealthLog;
      } catch (err) {
        console.error('Error toggling activity:', err);
        throw err;
      }
    },
    onSuccess: (updatedLog) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, (oldData: HealthLog[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(log => 
          log.id === updatedLog.id ? updatedLog : log
        );
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['health-logs'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating activity",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    retry: 1,
    retryDelay: 500,
  });

  // Callback functions for better stability
  const createHealthLog = useCallback(async (logData: CreateHealthLogInput) => {
    return createHealthLogMutation.mutateAsync(logData);
  }, [createHealthLogMutation]);

  const updateHealthLog = useCallback(async (logData: Partial<HealthLog> & { id: string }) => {
    return updateHealthLogMutation.mutateAsync(logData);
  }, [updateHealthLogMutation]);

  const toggleActivity = useCallback((logId: string) => {
    toggleActivityMutation.mutate(logId);
  }, [toggleActivityMutation]);

  const refreshLogs = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    healthLogs,
    isLoading,
    error,
    createHealthLog,
    createHealthLogSync: createHealthLogMutation.mutate,
    createHealthLogAsync: createHealthLogMutation.mutateAsync,
    updateHealthLog,
    updateHealthLogSync: updateHealthLogMutation.mutate,
    updateHealthLogAsync: updateHealthLogMutation.mutateAsync,
    toggleActivity,
    refreshLogs,
    isCreating: createHealthLogMutation.isPending,
    isUpdating: updateHealthLogMutation.isPending,
    isToggling: toggleActivityMutation.isPending,
    hasError: !!error,
    errorMessage: error ? getErrorMessage(error) : null,
  };
};