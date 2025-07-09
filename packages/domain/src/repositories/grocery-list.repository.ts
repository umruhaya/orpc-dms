import type { Result } from "@carbonteq/fp"
import type { GroceryListNotFoundError } from "@domain/errors/grocery-list.errors"
import type { RepoResult, RepoUnitResult } from "@domain/utils"
import type { PaginatedResult } from "@domain/utils/pagination.utils"
import type { ParseError } from "effect/ParseResult"
import type {
  GroceryListEntity,
  GroceryListType,
  GroceryListUpdateData,
} from "../entities/grocery-list.entity"
import type { UserType } from "../entities/user.entity"

export type GroceryListCountFilters = {
  userId?: UserType["id"]
  since?: Date
}

export type GroceryListFindFilters = {
  userId: UserType["id"]
  search?: string
  status?: "active" | "inactive"
  since?: Date
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export abstract class GroceryListRepository {
  abstract create(
    list: GroceryListEntity,
  ): Promise<RepoResult<GroceryListEntity, Error>>
  abstract findById(
    id: GroceryListType["id"],
  ): Promise<RepoResult<GroceryListEntity, GroceryListNotFoundError>>
  abstract update(
    id: GroceryListType["id"],
    updates: GroceryListUpdateData,
  ): Promise<void>
  abstract delete(
    id: GroceryListType["id"],
  ): Promise<RepoUnitResult<GroceryListNotFoundError>>
  abstract findByUserId(
    userId: UserType["id"],
  ): Promise<Result<GroceryListEntity[], ParseError[]>>
  abstract findWithFilters(
    filters: GroceryListFindFilters,
  ): Promise<Result<PaginatedResult<GroceryListEntity>, ParseError[]>>
  abstract count(filters: GroceryListCountFilters): Promise<number>
}
