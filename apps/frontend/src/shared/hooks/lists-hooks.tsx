import { type QueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { orpc } from "../orpc"

type Params = {
  limit?: number
  page?: number
  search?: string
  status?: "active" | "inactive"
}

const listsQueryOptions = (params: Params = {}) => {
  return orpc.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 50,
      page: 1,
      search: undefined,
      status: undefined,
      ...params,
    },
  })
}

const listQueryOptions = (id: string) =>
  orpc.authenticated.groceryList.getListById.queryOptions({
    input: { params: { id } },
  })

export const prefetchList = (queryClient: QueryClient, id: string) =>
  queryClient.ensureQueryData(listQueryOptions(id))
export const useList = (id: string) => useSuspenseQuery(listQueryOptions(id))

export const prefetchLists = (queryClient: QueryClient) =>
  queryClient.ensureQueryData(
    listsQueryOptions({ limit: 5, page: 1, search: "" }),
  )

export const useLists = (params: Params = {}) =>
  useSuspenseQuery(listsQueryOptions(params))
