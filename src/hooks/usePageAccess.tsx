import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePageAccess = (pagePath: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pageAccess', user?.id, pagePath],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc('can_access_page' as any, {
        _user_id: user.id,
        _page_path: pagePath
      });
      
      if (error) {
        console.error('Error checking page access:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
