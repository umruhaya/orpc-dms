import { useQuery } from "@tanstack/react-query"
import { orpc } from "../orpc"

export const useDashboardStats = () => {
  const opts = orpc.authenticated.groceryList.getStats.queryOptions()

  return useQuery(opts)
}

export const useRecentLists = () => {
  const opts = orpc.authenticated.groceryList.getRecentLists.queryOptions({
    input: { page: 1, limit: 5 },
    select: (data) =>
      data.lists.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        updatedAt: list.updatedAt.toString(),
      })),
  })

  return useQuery(opts)
}

export const useDashboard = () => {
  const statsQuery = useDashboardStats()
  const recentListsQuery = useRecentLists()

  const dashboardData =
    statsQuery.data && recentListsQuery.data
      ? {
          totalLists: statsQuery.data.totalLists,
          recentLists: recentListsQuery.data,
        }
      : null

  return {
    dashboardData,
    isLoading: statsQuery.isLoading || recentListsQuery.isLoading,
    error: statsQuery.error || recentListsQuery.error,
    refetch: () => {
      statsQuery.refetch()
      recentListsQuery.refetch()
    },
  }
}
