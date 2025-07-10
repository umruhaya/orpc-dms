import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useCallback } from "react"
import { getAuthSession, sessionQueryKey } from "./auth-client"

export const useSessionCache = () => {
  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const result = await getAuthSession()
      return result.session
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  })

  const invalidateSession = () => {
    queryClient.invalidateQueries({ queryKey: sessionQueryKey })
  }

  return {
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,
    invalidateSession,
  }
}

export const prefetchSession = (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const result = await getAuthSession()
      return result.session
    },
    staleTime: 4 * 60 * 1000, // 4 minutes
  })
}

export const useInvalidateSession = () => {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: sessionQueryKey })
  }, [queryClient])
}

export const getCachedAuthSession = async (queryClient: QueryClient) => {
  const cachedSession = queryClient.getQueryData(sessionQueryKey)

  if (cachedSession !== undefined) {
    return { session: cachedSession }
  }

  const result = await queryClient.fetchQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const sessionResult = await getAuthSession()
      return sessionResult.session
    },
    staleTime: 4 * 60 * 1000,
  })

  return { session: result }
}
