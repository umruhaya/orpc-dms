import { useQuery } from "@tanstack/react-query"

export interface DashboardStats {
  totalLists: number
  recentLists: Array<{
    id: string
    name: string
    description: string
    updatedAt: string
  }>
}

export const useDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      // This will need to be implemented once the backend route is created
      // For now, return mock data
      return {
        totalLists: 0,
        recentLists: [],
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
  }
}
