import { Button, Card, Group, Title } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { List, Plus } from "lucide-react"

export const QuickActions = () => {
  return (
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
  )
}
