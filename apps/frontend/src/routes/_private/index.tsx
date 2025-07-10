import { Container, Stack, Title } from "@mantine/core"
import { createFileRoute } from "@tanstack/react-router"
import {
  DashboardStatsContainer,
  QuickActions,
  RecentListsContainer,
} from "../../components/dashboard"
import {
  dashboardStatsQueryOptions,
  recentListsQueryOptions,
} from "../../shared/hooks/dashboard-hooks"

const Home = () => {
  const { user } = Route.useRouteContext()

  return (
    <Container fluid p="xl" pt="xl">
      <Stack gap="2rem">
        <Title order={2}>Welcome back, {user.name}! 👋</Title>
        <QuickActions />
        <DashboardStatsContainer />
        <RecentListsContainer />
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute("/_private/")({
  component: Home,
  head: () => ({ meta: [{ title: "Dashboard" }] }),
  loader: async ({ context }) => {
    const { queryClient, orpc } = context

    // Ensure data is available for SSR
    await Promise.all([
      queryClient.ensureQueryData(dashboardStatsQueryOptions(orpc)),
      queryClient.ensureQueryData(recentListsQueryOptions(orpc)),
    ])
  },
})
