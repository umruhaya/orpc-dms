import type { GroceryList } from "@contract/schemas/grocery-list"
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { Clock } from "lucide-react"

type RecentListsProps = {
  lists: GroceryList[]
}

const ListCard = ({ list }: { list: GroceryList }) => {
  console.debug("got list", list)

  return (
    <Card padding="md" radius="md" shadow="sm" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} size="lg" truncate>
          {list.name}
        </Text>
        {list.active ? (
          <Badge color="blue" variant="light">
            Active
          </Badge>
        ) : null}
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

export const RecentLists = ({ lists }: RecentListsProps) => {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Recent Lists</Title>
        <Button component={Link} size="sm" to="/lists" variant="subtle">
          View All Lists
        </Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
