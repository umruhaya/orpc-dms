import type { Result, UnitResult } from "@carbonteq/fp"
import { Result as R } from "@carbonteq/fp"
import type {
  GroceryListEntity,
  GroceryListType,
  GroceryListUpdateData,
} from "@domain/entities/grocery-list.entity"
import { GroceryListEntity as GList } from "@domain/entities/grocery-list.entity"
import type { UserType } from "@domain/entities/user.entity"
import { GroceryListNotFoundError } from "@domain/errors/grocery-list.errors"
import { GroceryListRepository } from "@domain/repositories/grocery-list.repository"
import { DateTime } from "@domain/utils/refined-types"
import { desc, eq } from "drizzle-orm"
import { injectable } from "tsyringe"
import type { AppDatabase } from "../conn"
import { InjectDb } from "../conn"
import { groceryLists } from "../schema"

@injectable()
export class DrizzleGroceryListRepository extends GroceryListRepository {
  constructor(@InjectDb() private readonly db: AppDatabase) {
    super()
  }

  async create(
    list: GroceryListEntity,
  ): Promise<Result<GroceryListEntity, Error>> {
    try {
      const values = {
        name: list.name,
        description: list.description,
        userId: list.ownerId,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
        isActive: true,
      } satisfies typeof groceryLists.$inferInsert

      const [inserted] = await this.db
        .insert(groceryLists)
        .values(values)
        .returning()

      if (!inserted) {
        return R.Err(new Error("Failed to create grocery list"))
      }

      return R.Ok(this.mapToEntity(inserted))
    } catch (error) {
      return R.Err(error as Error)
    }
  }

  async findById(
    id: GroceryListType["id"],
  ): Promise<Result<GroceryListEntity, GroceryListNotFoundError>> {
    try {
      const result = await this.db
        .select()
        .from(groceryLists)
        .where(eq(groceryLists.id, id))
        .limit(1)

      const row = result[0]
      if (!row) {
        return R.Err(new GroceryListNotFoundError(id))
      }

      return R.Ok(this.mapToEntity(row))
    } catch {
      return R.Err(new GroceryListNotFoundError(id))
    }
  }

  async update(
    id: GroceryListType["id"],
    updates: GroceryListUpdateData,
  ): Promise<void> {
    await this.db
      .update(groceryLists)
      .set({
        ...updates,
        updatedAt: DateTime.now(),
      })
      .where(eq(groceryLists.id, id))
  }

  async delete(
    id: GroceryListType["id"],
  ): Promise<UnitResult<GroceryListNotFoundError>> {
    try {
      const result = await this.db
        .update(groceryLists)
        .set({
          isActive: false,
          updatedAt: DateTime.now(),
        })
        .where(eq(groceryLists.id, id))
        .returning({ id: groceryLists.id })

      if (result.length === 0) {
        return R.Err(new GroceryListNotFoundError(id))
      }

      return R.UNIT_RESULT
    } catch {
      return R.Err(new GroceryListNotFoundError(id))
    }
  }

  async findByUserId(userId: UserType["id"]): Promise<GroceryListEntity[]> {
    const results = await this.db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.userId, userId))
      .orderBy(desc(groceryLists.updatedAt))

    return results.map((row) => this.mapToEntity(row))
  }

  private mapToEntity(
    row: typeof groceryLists.$inferSelect,
  ): GroceryListEntity {
    return GList.from({
      id: row.id,
      name: row.name,
      description: row.description,
      ownerId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
