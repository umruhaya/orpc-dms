import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { orpc } from "../orpc";

export const useDashboardStats = () => {
  const opts = orpc.authenticated.groceryList.getStats.queryOptions();

  return useQuery(opts);
};

export const useRecentLists = () => {
  const since = useMemo(
    () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    [],
  );

  const opts = orpc.authenticated.groceryList.getLists.queryOptions({
    input: {
      limit: 5,
      page: 1,
      since,
      search: "",
    },
    select: (data) => data.items,
  });

  return useQuery(opts);
};
