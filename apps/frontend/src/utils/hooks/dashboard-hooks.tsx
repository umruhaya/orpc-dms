import { useSuspenseQuery } from "@tanstack/react-query"
import type { orpc as OrpcType } from "../orpc"
import { orpc } from "../orpc"

export const dashboardStatsQueryOptions = (orpcClient: typeof OrpcType) => {
  return orpcClient.authenticated.groceryList.getStats.queryOptions()
}

export const recentListsQueryOptions = (orpcClient: typeof OrpcType) => {
  return orpcClient.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 5,
      page: 1,
      sinceMs: 3 * 24 * 60 * 60 * 1000, // Last 3 days in milliseconds
    },
    select: (data: any) => data.items,
  })
}

export const useDashboardStats = () =>
  useSuspenseQuery(dashboardStatsQueryOptions(orpc))

export const useRecentLists = () =>
  useSuspenseQuery(recentListsQueryOptions(orpc))
