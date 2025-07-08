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
import { Link } from "@tanstack/react-router"
import { Check, Clock, List, Plus } from "lucide-react"

// interface DashboardProps {
//   stats: DashboardStats
//   userName: string
//   isLoading?: boolean
// }

// interface ListCardProps {
//   list: DashboardStats["recentLists"][0]
// }

const ListCard = ({ list }: ListCardProps) => {
  return (
    <Card padding="md" radius="md" shadow="sm" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg" truncate>
          {list.name}
        </Text>
        <Badge color="blue" variant="light">
          Active
        </Badge>
      </Group>

      <Text c="dimmed" lineClamp={2} mb="md" size="sm">
        {list.description || "No description"}
      </Text>

      <Group justify="space-between">
        <Group gap="xs">
          <Clock size={16} />
          <Text c="dimmed" size="xs">
            Updated {new Date(list.updatedAt).toLocaleDateString()}
          </Text>
        </Group>

        <Group gap="xs">
          <Button component={Link} size="xs" to="/lists" variant="light">
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
  color = "blue",
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
}) => {
  return (
    <Card padding="lg" radius="md" shadow="sm" withBorder>
      <Group justify="space-between">
        <Box>
          <Text c="dimmed" fw={700} size="sm" tt="uppercase">
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
        </Box>
        <ActionIcon color={color} radius="md" size="xl" variant="light">
          {icon}
        </ActionIcon>
      </Group>
    </Card>
  )
}

const EmptyState = () => {
  return (
    <Container py="xl" size="sm">
      <Stack align="center" gap="lg">
        <List color="var(--mantine-color-gray-5)" size={64} strokeWidth={1.5} />
        <Stack align="center" gap="xs">
          <Title order={3} ta="center">
            Welcome to Grocery Lists!
          </Title>
          <Text c="dimmed" ta="center">
            Create your first grocery list to get started with organizing your
            shopping.
          </Text>
        </Stack>
        <Button
          component={Link}
          leftSection={<Plus size={16} />}
          size="md"
          to="/lists/new"
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
        <Group align="flex-start" justify="space-between">
          <Box>
            <Title order={2}>Welcome back, {userName}! 👋</Title>
            <Text c="dimmed" size="lg">
              Here's what's happening with your grocery lists
            </Text>
          </Box>
          <Button
            component={Link}
            leftSection={<Plus size={16} />}
            to="/lists/new"
          >
            Create New List
          </Button>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          <StatCard
            color="blue"
            icon={<List size={24} />}
            title="Total Lists"
            value={stats.totalLists}
          />
          <StatCard
            color="green"
            icon={<Clock size={24} />}
            title="Recent Lists"
            value={stats.recentLists.length}
          />
          {/* Placeholder stats for future features */}
          <StatCard
            color="orange"
            icon={<Check size={24} />}
            title="Active Items"
            value="-"
          />
          <StatCard
            color="teal"
            icon={<Check size={24} />}
            title="Completed Today"
            value="-"
          />
        </SimpleGrid>

        {/* Recent Lists */}
        {stats.recentLists.length > 0 && (
          <Box>
            <Group justify="space-between" mb="md">
              <Title order={3}>Recent Lists</Title>
              <Button component={Link} size="sm" to="/lists" variant="subtle">
                View All Lists
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {stats.recentLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Quick Actions */}
        <Card padding="lg" radius="md" shadow="sm" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Quick Actions</Title>
          </Group>
          <Group>
            <Button
              component={Link}
              leftSection={<Plus size={16} />}
              to="/lists/new"
              variant="light"
            >
              Create New List
            </Button>
            <Button
              component={Link}
              leftSection={<List size={16} />}
              to="/lists"
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
