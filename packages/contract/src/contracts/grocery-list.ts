import { appAuthenticatedBase } from "@contract/utils/oc.base"
import {
  GroceryListCreateSchema,
  GroceryListId,
  GroceryListUpdateSchema,
} from "@domain/grocery-list/grocery-list.entity"
import {
  GetListsParamsSchema,
  GetListsResultSchema,
  GroceryListDetailsSchema,
} from "@domain/grocery-list/grocery-list.schemas"
import { type } from "@orpc/contract"
import { Schema as S } from "effect"

const DashboardStatsSchema = S.Struct({
  totalLists: S.Number,
  recentLists: S.Number,
  completedToday: S.Number,
  pendingItems: S.Number,
})

export type DashboardStats = S.Schema.Type<typeof DashboardStatsSchema>

const groceryListBase = appAuthenticatedBase

export const getStats = groceryListBase
  .route({
    method: "GET",
    path: "/grocery-list/stats",
    summary: "Get grocery list statistics for dashboard",
    tags: ["grocery-list"],
  })
  .input(type<void>())
  .output(S.standardSchemaV1(DashboardStatsSchema))

export const getLists = groceryListBase
  .route({
    method: "GET",
    path: "/grocery-list",
    summary: "Get grocery lists with optional filters and pagination",
    tags: ["grocery-list"],
  })
  .input(S.standardSchemaV1(GetListsParamsSchema))
  .output(S.standardSchemaV1(GetListsResultSchema))

export const fetchRecentLists = groceryListBase
  .route({
    method: "GET",
    path: "/grocery-list/recent",
    summary: "Get recent grocery lists",
    tags: ["grocery-list"],
  })
  .input(type<void>())
  .output(S.standardSchemaV1(GetListsResultSchema))

export const getListById = groceryListBase
  .route({
    method: "GET",
    path: "/grocery-list/:id",
    summary: "Get a grocery list by ID",
    tags: ["grocery-list"],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      S.Struct({
        params: S.Struct({
          id: GroceryListId,
        }),
      }),
    ),
  )
  .output(S.standardSchemaV1(GroceryListDetailsSchema))

export const createGroceryList = groceryListBase
  .route({
    method: "POST",
    path: "/grocery-list",
    summary: "Create a new grocery list",
    tags: ["grocery-list"],
  })
  .input(S.standardSchemaV1(GroceryListCreateSchema))
  .output(S.standardSchemaV1(GetListsResultSchema))

export const updateGroceryList = groceryListBase
  .route({
    method: "PATCH",
    path: "/grocery-list/:id",
    summary: "Update a grocery list",
    tags: ["grocery-list"],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      S.Struct({
        params: S.Struct({
          id: GroceryListId,
        }),
        body: GroceryListUpdateSchema,
      }),
    ),
  )
  .output(S.standardSchemaV1(GetListsResultSchema))

export const deleteGroceryList = groceryListBase
  .route({
    method: "DELETE",
    path: "/grocery-list/:id",
    summary: "Delete a grocery list",
    tags: ["grocery-list"],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      S.Struct({
        params: S.Struct({
          id: GroceryListId,
        }),
      }),
    ),
  )
  .output(S.standardSchemaV1(S.Void))

export default {
  getStats,
  getLists,
  fetchRecentLists,
  getListById,
  createGroceryList,
  updateGroceryList,
  deleteGroceryList,
}
