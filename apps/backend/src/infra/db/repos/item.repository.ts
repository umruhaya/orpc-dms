import { Result as R, type Result } from "@carbonteq/fp"
import type { GroceryListType } from "@domain/entities/grocery-list.entity"
import type {
  ItemEntity,
  ItemType,
  ItemUpdateDataEncoded,
} from "@domain/entities/item.entity"
import { ItemEntity as Item } from "@domain/entities/item.entity"
import type { UserType } from "@domain/entities/user.entity"
import {
  ItemNotFoundError,
  ItemValidationError,
} from "@domain/errors/item.errors"
import {
  type GroceryItemFilters,
  ItemRepository,
} from "@domain/repositories/item.repository"
import type { RepoResult } from "@domain/utils"
import { DateTime } from "@domain/utils/refined-types"
import { and, eq, gte } from "drizzle-orm"
import type { ParseError } from "effect/ParseResult"
import { injectable } from "tsyringe"
import type { AppDatabase } from "../conn"
import { InjectDb } from "../conn"
import { groceryListItems } from "../schema"

@injectable()
export class DrizzleItemRepository extends ItemRepository {
  constructor(@InjectDb() private readonly db: AppDatabase) {
    super()
  }

  async create(
    item: ItemEntity,
  ): Promise<RepoResult<ItemEntity, ItemValidationError>> {
    const encoded = item.serialize()

    if (encoded.isErr()) {
      return encoded
    }
    const data = encoded.unwrap()

    const values = {
      id: item.id,
      listId: item.listId,
      status: data.status,
      name: data.name,
      quantity: data.quantity,
      createdBy: item.createdBy,
    } satisfies typeof groceryListItems.$inferInsert

    const [inserted] = await this.db
      .insert(groceryListItems)
      .values(values)
      .returning()

    if (!inserted) {
      return R.Err(new ItemValidationError("Failed to create item"))
    }

    return this.mapToEntity(inserted)
  }

  async findById(
    id: ItemType["id"],
  ): Promise<RepoResult<ItemEntity, ItemNotFoundError>> {
    const result = await this.db.query.groceryListItems.findFirst({
      where: eq(groceryListItems.id, id),
    })

    if (!result) {
      return R.Err(new ItemNotFoundError(id))
    }

    return this.mapToEntity(result)
  }

  async findByListId(listId: GroceryListType["id"]): Promise<ItemEntity[]> {
    const results = await this.db
      .select()
      .from(groceryListItems)
      .where(eq(groceryListItems.listId, listId))

    const items = results.map((row) => this.mapToEntity(row))
    const validItems = items
      .filter((item) => item.isOk())
      .map((item) => item.unwrap())

    return validItems
    // Or Result.all(...) for later
  }

  async findByUserId(userId: UserType["id"]): Promise<ItemEntity[]> {
    // Note: This would require joining with grocery_lists to get items by user
    // For now, returning empty array as this method might need to be implemented differently
    // based on your actual use case
    return []
  }

  async update(
    id: ItemType["id"],
    updates: ItemUpdateDataEncoded,
  ): Promise<RepoResult<ItemEntity, ItemNotFoundError>> {
    const updateData: Partial<typeof groceryListItems.$inferInsert> = {
      updatedAt: DateTime.now(),
    }

    if (updates.name !== undefined) {
      updateData.name = updates.name
    }
    if (updates.quantity !== undefined) {
      updateData.quantity = updates.quantity
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status
    }

    const [updated] = await this.db
      .update(groceryListItems)
      .set(updateData)
      .where(eq(groceryListItems.id, id))
      .returning()

    if (!updated) {
      return R.Err(new ItemNotFoundError(id))
    }

    return this.mapToEntity(updated)
  }

  async delete(id: ItemType["id"]): Promise<Result<void, ItemNotFoundError>> {
    const result = await this.db
      .delete(groceryListItems)
      .where(eq(groceryListItems.id, id))
      .returning({ id: groceryListItems.id })

    if (result.length === 0) {
      return R.Err(new ItemNotFoundError(id))
    }

    return R.Ok(undefined)
  }

  async deleteByListId(listId: GroceryListType["id"]): Promise<void> {
    await this.db
      .delete(groceryListItems)
      .where(eq(groceryListItems.listId, listId))
  }

  async count(filters: GroceryItemFilters): Promise<number> {
    const conditions = []

    if (filters.listId) {
      conditions.push(eq(groceryListItems.listId, filters.listId))
    }
    if (filters.userId) {
      conditions.push(eq(groceryListItems.createdBy, filters.userId))
    }
    if (filters.status) {
      conditions.push(eq(groceryListItems.status, filters.status))
    }
    if (filters.updatedSince) {
      conditions.push(gte(groceryListItems.updatedAt, filters.updatedSince))
    }

    const c = await this.db.$count(
      groceryListItems,
      conditions.length > 0 ? and(...conditions) : undefined,
    )

    return c
  }

  private mapToEntity(
    row: typeof groceryListItems.$inferSelect,
  ): RepoResult<ItemEntity, ParseError> {
    return Item.fromEncoded({
      id: row.id,
      listId: row.listId,
      name: row.name,
      quantity: row.quantity,
      status: row.status,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
