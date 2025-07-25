import type { UserType } from "@domain/user/user.entity"
import type { RepoResult, RepoUnitResult } from "@domain/utils"
import type { Paginated } from "@domain/utils/pagination.utils"
import type {
  GroceryListEntity,
  GroceryListType,
  GroceryListUpdateData,
} from "./grocery-list.entity"
import type { GroceryListNotFoundError } from "./grocery-list.errors"

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
  ): Promise<RepoResult<GroceryListEntity[]>>
  abstract findWithFilters(
    filters: GroceryListFindFilters,
  ): Promise<RepoResult<Paginated<GroceryListEntity>>>
  abstract count(filters: GroceryListCountFilters): Promise<number>
}
