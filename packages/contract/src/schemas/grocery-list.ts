import { GroceryListSchema } from "@domain/entities/grocery-list.entity"
import { PaginationParamsSchema } from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

const list = GroceryListSchema.pipe(S.omit("ownerId"))
export type GroceryList = S.Schema.Encoded<typeof list>

const lists = S.Array(list)
export const ListSummarySchema = S.Struct({
  lists,
})

export const DashboardStatsSchema = S.Struct({
  totalLists: S.Number,
  recentLists: S.Number,
  activeItems: S.Number,
  completedToday: S.Number,
})

export const RecentListsParamsSchema = PaginationParamsSchema

export type ListSummary = S.Schema.Encoded<typeof ListSummarySchema>
export type DashboardStats = S.Schema.Encoded<typeof DashboardStatsSchema>
export type RecentListsParams = S.Schema.Encoded<typeof RecentListsParamsSchema>
