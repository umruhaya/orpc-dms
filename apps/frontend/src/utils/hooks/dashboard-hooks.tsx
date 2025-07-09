import { useQuery } from "@tanstack/react-query"
import { orpc } from "../orpc"

export const useDashboardStats = () => {
  const opts = orpc.authenticated.groceryList.getStats.queryOptions()

  return useQuery(opts)
}

export const useRecentLists = () => {
  const opts = orpc.authenticated.groceryList.getRecentLists.queryOptions({
    input: { page: 1, limit: 5 },
    select: (data) => data.lists,
    // select: (data) =>
    //   data.lists.map((list) => ({
    //     id: list.id,
    //     name: list.name,
    //     description: list.description,
    //     updatedAt: list.updatedAt.toString(),
    //
    //   })),
  })

  return useQuery(opts)
}
