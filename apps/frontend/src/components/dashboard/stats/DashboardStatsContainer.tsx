import { useDashboardStats } from "../../../utils/hooks/dashboard-hooks";
import { DashboardStats } from "./DashboardStats";
import { DashboardStatsSkeleton } from "./DashboardStatsSkeleton";

export const DashboardStatsContainer = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardStatsSkeleton />;
  }

  if (!stats || stats.totalLists === 0) {
    return null;
  }

  return <DashboardStats stats={stats} />;
};
