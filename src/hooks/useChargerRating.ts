import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChargerRating {
  id: string;
  charger_id: string;
  user_id: string;
  rating: 'up' | 'down';
  created_at: string;
}

export const useChargerRating = (chargerId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's current rating for this charger
  const { data: userRating, isLoading: loadingUserRating } = useQuery({
    queryKey: ['charger-rating', chargerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('charger_ratings')
        .select('*')
        .eq('charger_id', chargerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user rating:', error);
        return null;
      }

      return data as ChargerRating | null;
    },
  });

  // Submit or update rating
  const rateMutation = useMutation({
    mutationFn: async (rating: 'up' | 'down') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be logged in to rate');
      }

      setIsSubmitting(true);

      // If user already has a rating, update it
      if (userRating) {
        if (userRating.rating === rating) {
          // Remove rating if clicking the same button
          const { error } = await supabase
            .from('charger_ratings')
            .delete()
            .eq('id', userRating.id);

          if (error) throw error;
          return null;
        } else {
          // Update existing rating
          const { data, error } = await supabase
            .from('charger_ratings')
            .update({ rating, updated_at: new Date().toISOString() })
            .eq('id', userRating.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      } else {
        // Create new rating
        const { data, error } = await supabase
          .from('charger_ratings')
          .insert({
            charger_id: chargerId,
            user_id: user.id,
            rating,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['charger-rating', chargerId] });
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      
      if (data) {
        toast({
          title: "Rating submitted",
          description: `Thanks for rating this charger!`,
        });
      } else {
        toast({
          title: "Rating removed",
          description: "Your rating has been removed.",
        });
      }
    },
    onError: (error) => {
      console.error('Rating error:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const submitRating = useCallback((rating: 'up' | 'down') => {
    rateMutation.mutate(rating);
  }, [rateMutation]);

  return {
    userRating,
    loadingUserRating,
    isSubmitting,
    submitRating,
  };
};