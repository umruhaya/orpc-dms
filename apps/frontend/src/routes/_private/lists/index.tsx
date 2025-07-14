import { ListCard } from "@app/components/shared/ListCard"
import type { GroceryListEncoded } from "@contract/schemas/grocery-list"
import {
  Button,
  Container,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { prefetchLists, useLists } from "../../../shared/hooks/lists-hooks"

const GroceryListsPage = () => {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"active" | "inactive" | "">("")
  const [debouncedSearch] = useDebouncedValue(search, 300)

  const { data } = useLists({
    limit: 50,
    page: 1,
    search: debouncedSearch || undefined,
    status: status || undefined,
  })

  const lists = data.items

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

        <Group gap="md">
          <TextInput
            leftSection={<Search size={16} />}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search lists..."
            style={{ flex: 1, maxWidth: 300 }}
            value={search}
          />
          <Select
            clearable
            data={[
              { value: "", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            onChange={(value) => setStatus(value as "active" | "inactive" | "")}
            placeholder="Filter by status"
            style={{ minWidth: 150 }}
            value={status}
          />
        </Group>

        {lists.length === 0 ? (
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
            {lists.map((list: GroceryListEncoded) => (
              <ListCard key={list.id} list={list} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute("/_private/lists/")({
  component: GroceryListsPage,
  head: () => ({ meta: [{ title: "All Lists" }] }),
  loader: async ({ context }) => {
    const { queryClient } = context

    await prefetchLists(queryClient, {
      limit: 5,
      page: 1,
      search: "",
    })
  },
})
