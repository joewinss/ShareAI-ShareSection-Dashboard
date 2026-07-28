import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import getStats from '@/pages/api/dashboard/getStats';

export const STATS_QUERY_KEY = ['stats'];

export const useStats = (options = {}) => {
  const {
    poll = false,
    intervalMs = 60000,
    staleTime = 5000,
    enabled = true,
    refetchOnWindowFocus = true,
    refetchOnMount = 'always',
    queryKey = STATS_QUERY_KEY,
    scopeKey = 'default',
    limit = 0,
    skip = 0,
    query = {},
  } = options;

  return useQuery({
    queryKey: [...queryKey, scopeKey, limit, skip, query],
    queryFn: () => getStats(limit, skip, query),
    staleTime,
    enabled,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchInterval: poll ? intervalMs : false,
  });
};

export const useRefreshStats = (scopeKey = 'default', queryKey = STATS_QUERY_KEY) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: [...queryKey, scopeKey] });
  }, [queryClient, queryKey, scopeKey]);
};
