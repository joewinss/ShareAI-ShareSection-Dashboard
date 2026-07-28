import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import getCurrentUsageAndLimitByUserId from '@/pages/api/user/getCurrentUsageAndLimitByUserId';


export const CREDIT_BALANCE_QUERY_KEY = ['creditBalance'];

export const useCreditBalance = (options = {}) => {
  const {
    poll = false,
    intervalMs = 3000,
    staleTime = 5000,
    enabled = true,
    refetchOnWindowFocus = true,
    queryKey = CREDIT_BALANCE_QUERY_KEY,
  } = options;

  return useQuery({
    queryKey,
    queryFn: () => getCurrentUsageAndLimitByUserId(),
    staleTime,
    enabled,
    refetchOnWindowFocus,
    refetchInterval: poll ? intervalMs : false,
  });
};

export const useRefreshCreditBalance = (queryKey = CREDIT_BALANCE_QUERY_KEY) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);
};
