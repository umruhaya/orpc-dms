import { useSuspenseQuery } from "@tanstack/react-query"
import type { orpc as OrpcType } from "../orpc"
import { orpc } from "../orpc"

export const dashboardStatsQueryOptions = (orpcClient: typeof OrpcType) => {
  return orpcClient.authenticated.groceryList.getStats.queryOptions()
}

export const recentListsQueryOptions = (orpcClient: typeof OrpcType) => {
  return orpcClient.authenticated.groceryList.fetchRecentLists.queryOptions({
    select: (data) => data.items,
    retry: 2,
  })
}

export const useDashboardStats = () =>
  useSuspenseQuery(dashboardStatsQueryOptions(orpc))

export const useRecentLists = () =>
  useSuspenseQuery(recentListsQueryOptions(orpc))
