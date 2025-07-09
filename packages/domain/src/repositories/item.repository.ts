import type {
  ItemNotFoundError,
  ItemValidationError,
} from "@domain/errors/item.errors"
import type { RepoResult, RepoUnitResult } from "@domain/utils"
import type { GroceryListType } from "../entities/grocery-list.entity"
import type {
  ItemEntity,
  ItemStatus,
  ItemType,
  ItemUpdateDataEncoded,
} from "../entities/item.entity"
import type { UserType } from "../entities/user.entity"

export type GroceryItemFilters = {
  userId?: UserType["id"]
  listId?: GroceryListType["id"]
  status?: ItemStatus
  updatedSince?: Date
}

export abstract class ItemRepository {
  abstract create(
    item: ItemEntity,
  ): Promise<RepoResult<ItemEntity, ItemValidationError>>

  abstract findById(
    id: ItemType["id"],
  ): Promise<RepoResult<ItemEntity, ItemNotFoundError>>

  abstract findByListId(listId: GroceryListType["id"]): Promise<ItemEntity[]>
  abstract findByUserId(userId: UserType["id"]): Promise<ItemEntity[]>

  abstract update(
    id: ItemType["id"],
    updates: ItemUpdateDataEncoded,
  ): Promise<RepoResult<ItemEntity, ItemNotFoundError>>

  abstract delete(
    id: ItemType["id"],
  ): Promise<RepoUnitResult<ItemNotFoundError>>

  abstract deleteByListId(listId: GroceryListType["id"]): Promise<void>

  abstract count(filters: GroceryItemFilters): Promise<number>
}
