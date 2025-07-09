import type { GroceryList } from "@contract/schemas/grocery-list";
import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

type ListCardProps = {
  list: GroceryList;
};

export const ListCard = ({ list }: ListCardProps) => {
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
        ) : (
          <Badge color="gray" variant="light">
            Inactive
          </Badge>
        )}
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
          <Button
            component={Link}
            size="xs"
            to={`/lists/${list.id}`}
            variant="light"
          >
            View
          </Button>
        </Group>
      </Group>
    </Card>
  );
};
