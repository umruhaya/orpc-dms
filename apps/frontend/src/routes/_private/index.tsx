import { Container, Flex, Title } from "@mantine/core"
import { createFileRoute } from "@tanstack/react-router"
import Dashboard from "../../components/dashboard/Dashboard"
import { useDashboard } from "../../utils/hooks/dashboard-hooks"

const Home = () => {
  const { user } = Route.useRouteContext()
  const { dashboardData, isLoading } = useDashboard()

  // Show loading state
  if (isLoading || !dashboardData) {
    return (
      <Container h="100vh" p="xs" w="100%">
        <Flex align="center" justify="center">
          <Title order={2}>Loading...</Title>
        </Flex>
      </Container>
    )
  }

  return (
    <Dashboard
      stats={dashboardData}
      userName={user.name}
      isLoading={isLoading}
    />
  )
}

export const Route = createFileRoute("/_private/")({
  component: Home,
  head: () => ({ meta: [{ title: "Dashboard" }] }),
})
