import { Container, Stack, Title } from "@mantine/core"
import { createFileRoute } from "@tanstack/react-router"
import {
  DashboardStatsContainer,
  QuickActions,
  RecentListsContainer,
} from "../../components/dashboard"

const Home = () => {
  const { user } = Route.useRouteContext()

  return (
    <Container fluid p="md">
      <Stack gap="lg">
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
})
