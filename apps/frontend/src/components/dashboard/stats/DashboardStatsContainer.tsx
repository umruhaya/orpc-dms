import { Suspense } from "react"
import { useDashboardStats } from "../../../utils/hooks/dashboard-hooks"
import { DashboardStats } from "./DashboardStats"
import { DashboardStatsSkeleton } from "./DashboardStatsSkeleton"

const StatsContent = () => {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return <DashboardStatsSkeleton />
  }

  if (!stats || stats.totalLists === 0) {
    return null
  }

  return <DashboardStats stats={stats} />
}

export const DashboardStatsContainer = () => {
  return (
    <Suspense fallback={<DashboardStatsSkeleton />}>
      <StatsContent />
    </Suspense>
  )
}
