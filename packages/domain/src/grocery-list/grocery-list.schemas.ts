import { GroceryListSchema } from "@domain/grocery-list/grocery-list.entity"
import { ItemSchema } from "@domain/grocery-list-item/item.entity"
import { UserSchema } from "@domain/user/user.entity"
import {
  PaginatedResultSchema,
  PaginationParamsSchema,
} from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

const list = GroceryListSchema.pipe(S.omit("ownerId"))
export type GroceryListEncoded = Omit<
  S.Schema.Encoded<typeof list>,
  "createdAt" | "updatedAt"
> & {
  createdAt: number | string
  updatedAt: number | string
}

export const GetListsParamsSchema = PaginationParamsSchema.pipe(
  S.extend(
    S.Struct({
      search: S.optional(S.String),
      status: S.optional(S.Literal("active", "inactive")),
      sinceMs: S.optional(S.Number.pipe(S.int(), S.positive())),
    }),
  ),
)

export const GetListsResultSchema = PaginatedResultSchema(list)

export const GroceryListDetailsSchema = GroceryListSchema.pipe(
  S.omit("ownerId"),
  S.extend(
    S.Struct({
      owner: UserSchema,
      items: S.Array(ItemSchema),
      stats: S.Struct({
        totalItems: S.Number,
        pendingItems: S.Number,
        completedItems: S.Number,
        completionPercentage: S.Number,
      }),
    }),
  ),
)

export type GroceryListDetails = S.Schema.Encoded<
  typeof GroceryListDetailsSchema
>

export type GetListsParams = S.Schema.Type<typeof GetListsParamsSchema>
export type GetListsResult = S.Schema.Encoded<typeof GetListsResultSchema>
