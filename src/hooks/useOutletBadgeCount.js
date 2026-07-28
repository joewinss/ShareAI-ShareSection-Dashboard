import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import getOutletBadgeCount from '@/pages/api/user/getOutletBadgeCount';

export const OUTLET_BADGE_COUNT_QUERY_KEY = ['outletBadgeCount'];

export const useOutletBadgeCount = (options = {}) => {
  const {
    poll = false,
    intervalMs = 60000,
    staleTime = 5000,
    enabled = true,
    refetchOnWindowFocus = true,
    refetchOnMount = 'always',
    queryKey = OUTLET_BADGE_COUNT_QUERY_KEY,
    limit = 0,
    skip = 0,
    query = { Status: 0 },
  } = options;

  return useQuery({
    queryKey: [...queryKey, limit, skip, query],
    queryFn: () => getOutletBadgeCount(limit, skip, query),
    staleTime,
    enabled,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchInterval: poll ? intervalMs : false,
  });
};

export const useRefreshOutletBadgeCount = (queryKey = OUTLET_BADGE_COUNT_QUERY_KEY) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);
};
