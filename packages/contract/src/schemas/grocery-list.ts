import { GroceryListSchema } from "@domain/entities/grocery-list.entity";
import {
  PaginatedResultSchema,
  PaginationParamsSchema,
} from "@domain/utils/pagination.utils";
import { Schema as S } from "effect";

const list = GroceryListSchema.pipe(S.omit("ownerId"));
export type GroceryList = S.Schema.Encoded<typeof list>;

export const GetListsParamsSchema = PaginationParamsSchema.pipe(
  S.extend(
    S.Struct({
      search: S.optional(S.String),
      status: S.optional(S.Literal("active", "inactive")),
      sinceMs: S.optional(S.Number.pipe(S.int(), S.positive())),
    }),
  ),
);

export const GetListsResultSchema = PaginatedResultSchema(list);

export const DashboardStatsSchema = S.Struct({
  totalLists: S.Number,
  recentLists: S.Number,
  pendingItems: S.Number,
  completedToday: S.Number,
});

export type GetListsParams = S.Schema.Encoded<typeof GetListsParamsSchema>;
export type GetListsResult = S.Schema.Encoded<typeof GetListsResultSchema>;
export type DashboardStats = S.Schema.Encoded<typeof DashboardStatsSchema>;
