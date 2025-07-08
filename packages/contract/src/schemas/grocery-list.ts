import { GroceryListSchema } from "@domain/entities/grocery-list.entity"
import { PaginationParamsSchema } from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

const lists = S.Array(GroceryListSchema.pipe(S.omit("ownerId")))
export const ListSummarySchema = S.Struct({
  lists,
})

export const DashboardStatsSchema = S.Struct({
  totalLists: S.Number,
  recentLists: lists,
})

export const RecentListsParamsSchema = PaginationParamsSchema

export type ListSummary = S.Schema.Type<typeof ListSummarySchema>
export type ListStats = S.Schema.Type<typeof DashboardStatsSchema>
export type RecentListsParams = S.Schema.Type<typeof RecentListsParamsSchema>
