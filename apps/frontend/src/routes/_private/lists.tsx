import type { GroceryList } from "@contract/schemas/grocery-list"
import { orpc } from "@app/utils/orpc"
import { ListCard } from "@app/components/shared/ListCard"
import {
  Button,
  Container,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { useState } from "react"

const GroceryListsPage = () => {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "">("")
  const [debouncedSearch] = useDebouncedValue(search, 300)

  const { data, isLoading, error } = useQuery({
    ...orpc.authenticated.groceryList.getLists.queryOptions({
      input: {
        limit: 50,
        page: 1,
        search: debouncedSearch || undefined,
        status: status || undefined,
      },
    }),
  })

  const lists = data?.items || []

  return (
    <Container fluid p="xl" pt="xl">
      <Stack gap="2rem">
        <Group justify="space-between">
          <Title order={2}>All Grocery Lists</Title>
          <Button
            component={Link}
            leftSection={<Plus size={16} />}
            to="/lists/new"
          >
            Create New List
          </Button>
        </Group>

        {/* Filters */}
        <Group gap="md">
          <TextInput
            placeholder="Search lists..."
            leftSection={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <Select
            placeholder="Filter by status"
            data={[
              { value: "", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            value={status}
            onChange={(value) => setStatus(value as "active" | "inactive" | "")}
            clearable
            style={{ minWidth: 150 }}
          />
        </Group>

        {/* Content */}
        {isLoading ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : error ? (
          <Text c="red" ta="center">
            Error loading lists. Please try again.
          </Text>
        ) : !lists || lists.length === 0 ? (
          <Stack align="center" gap="md" p="xl">
            <Text c="dimmed" size="lg" ta="center">
              {search || status
                ? "No lists match your filters"
                : "No grocery lists found"}
            </Text>
            <Text c="dimmed" ta="center">
              {search || status
                ? "Try adjusting your search or filters"
                : "Create your first grocery list to get started"}
            </Text>
            {!search && !status && (
              <Button
                component={Link}
                leftSection={<Plus size={16} />}
                to="/lists/new"
              >
                Create Your First List
              </Button>
            )}
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {lists.map((list: GroceryList) => (
              <ListCard key={list.id} list={list} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute("/_private/lists")({
  component: GroceryListsPage,
  head: () => ({ meta: [{ title: "All Lists" }] }),
})
