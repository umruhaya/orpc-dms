import { useQuery } from "@tanstack/react-query"
import { orpc } from "../orpc"

export const useDashboardStats = () => {
  const opts = orpc.authenticated.groceryList.getStats.queryOptions()

  return useQuery(opts)
}

export const useRecentLists = () => {
  const opts = orpc.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 5,
      page: 1,
      sinceMs: 30 * 24 * 60 * 60 * 1000, // Last 30 days in milliseconds
    },
    select: (data) => data.items,
  })

  return useQuery(opts)
}
