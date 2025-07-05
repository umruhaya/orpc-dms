import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { IconCheck, IconClock, IconList, IconPlus } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import type { DashboardStats } from "../../utils/hooks/dashboard-hooks"

interface DashboardProps {
  stats: DashboardStats
  userName: string
  isLoading?: boolean
}

interface ListCardProps {
  list: DashboardStats["recentLists"][0]
}

const ListCard = ({ list }: ListCardProps) => {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg" truncate>
          {list.name}
        </Text>
        <Badge color="blue" variant="light">
          Active
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
        {list.description || "No description"}
      </Text>

      <Group justify="space-between">
        <Group gap="xs">
          <IconClock size={16} />
          <Text size="xs" c="dimmed">
            Updated {new Date(list.updatedAt).toLocaleDateString()}
          </Text>
        </Group>

        <Group gap="xs">
          <Button
            component={Link}
            to="/lists"
            variant="light"
            size="xs"
          >
            View
          </Button>
        </Group>
      </Group>
    </Card>
  )
}

const StatCard = ({
  title,
  value,
  icon,
  color = "blue"
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <Box>
          <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
        </Box>
        <ActionIcon
          color={color}
          size="xl"
          radius="md"
          variant="light"
        >
          {icon}
        </ActionIcon>
      </Group>
    </Card>
  )
}

const EmptyState = () => {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="lg">
        <IconList size={64} stroke={1.5} color="var(--mantine-color-gray-5)" />
        <Stack align="center" gap="xs">
          <Title order={3} ta="center">
            Welcome to Grocery Lists!
          </Title>
          <Text c="dimmed" ta="center">
            Create your first grocery list to get started with organizing your shopping.
          </Text>
        </Stack>
        <Button
          component={Link}
          to="/lists/new"
          leftSection={<IconPlus size={16} />}
          size="md"
        >
          Create Your First List
        </Button>
      </Stack>
    </Container>
  )
}

const Dashboard = ({ stats, userName, isLoading }: DashboardProps) => {
  if (isLoading) {
    return (
      <Container fluid p="md">
        <Stack gap="lg">
          <Text>Loading dashboard...</Text>
        </Stack>
      </Container>
    )
  }

  // Show empty state for new users
  if (stats.totalLists === 0) {
    return <EmptyState />
  }

  return (
    <Container fluid p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Welcome back, {userName}! 👋</Title>
            <Text c="dimmed" size="lg">
              Here's what's happening with your grocery lists
            </Text>
          </Box>
          <Button
            component={Link}
            to="/lists/new"
            leftSection={<IconPlus size={16} />}
          >
            Create New List
          </Button>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 4 }}
          spacing="lg"
        >
          <StatCard
            title="Total Lists"
            value={stats.totalLists}
            icon={<IconList size={24} />}
            color="blue"
          />
          <StatCard
            title="Recent Lists"
            value={stats.recentLists.length}
            icon={<IconClock size={24} />}
            color="green"
          />
          {/* Placeholder stats for future features */}
          <StatCard
            title="Active Items"
            value="-"
            icon={<IconCheck size={24} />}
            color="orange"
          />
          <StatCard
            title="Completed Today"
            value="-"
            icon={<IconCheck size={24} />}
            color="teal"
          />
        </SimpleGrid>

        {/* Recent Lists */}
        {stats.recentLists.length > 0 && (
          <Box>
            <Group justify="space-between" mb="md">
              <Title order={3}>Recent Lists</Title>
              <Button
                component={Link}
                to="/lists"
                variant="subtle"
                size="sm"
              >
                View All Lists
              </Button>
            </Group>

            <SimpleGrid
              cols={{ base: 1, sm: 2, lg: 3 }}
              spacing="md"
            >
              {stats.recentLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Quick Actions */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Quick Actions</Title>
          </Group>
          <Group>
            <Button
              component={Link}
              to="/lists/new"
              leftSection={<IconPlus size={16} />}
              variant="light"
            >
              Create New List
            </Button>
            <Button
              component={Link}
              to="/lists"
              leftSection={<IconList size={16} />}
              variant="light"
            >
              Browse All Lists
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  )
}

export default Dashboard
