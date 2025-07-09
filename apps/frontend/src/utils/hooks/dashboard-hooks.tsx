import { useQuery } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { orpc } from "../orpc";
import type { orpc as OrpcType } from "../orpc";

export const useDashboardStats = () => {
  const opts = orpc.authenticated.groceryList.getStats.queryOptions();

  return useQuery(opts);
};

export const useRecentLists = () => {
  const opts = orpc.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 5,
      page: 1,
      sinceMs: 30 * 24 * 60 * 60 * 1000, // Last 30 days in milliseconds
      search: "",
    },
    select: (data: any) => data.items,
  });

  return useQuery(opts);
};

// Query options for SSR
export const dashboardStatsQueryOptions = (orpcClient: typeof OrpcType) => {
  return orpcClient.authenticated.groceryList.getStats.queryOptions();
};

export const recentListsQueryOptions = (orpcClient: typeof OrpcType) => {
  return orpcClient.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 5,
      page: 1,
      sinceMs: 30 * 24 * 60 * 60 * 1000, // Last 30 days in milliseconds
      search: "",
    },
    select: (data: any) => data.items,
  });
};
