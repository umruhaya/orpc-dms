import { ListCard } from "@app/components/shared/ListCard"
import type { GroceryList } from "@contract/schemas/grocery-list"
import { Button, Group, SimpleGrid, Stack, Title } from "@mantine/core"
import { Link } from "@tanstack/react-router"

type RecentListsProps = {
  lists: GroceryList[]
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
