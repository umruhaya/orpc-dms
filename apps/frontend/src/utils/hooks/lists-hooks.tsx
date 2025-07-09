import { useSuspenseQuery } from "@tanstack/react-query"
import { type orpc as OrpcType, orpc } from "../orpc"

type Params = {
  limit?: number
  page?: number
  search?: string
  status?: "active" | "inactive"
}

export const listsQueryOptions = (
  orpcClient: typeof OrpcType,
  params: Params = {},
) => {
  return orpcClient.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 50,
      page: 1,
      search: undefined,
      status: undefined,
      ...params,
    },
  })
}

export const useLists = (params: Params = {}) =>
  useSuspenseQuery(listsQueryOptions(orpc, params))
