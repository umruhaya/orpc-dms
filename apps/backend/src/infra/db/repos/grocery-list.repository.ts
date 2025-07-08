import { Result as R, type Result } from "@carbonteq/fp"
import type {
  GroceryListEntity,
  GroceryListType,
  GroceryListUpdateData,
} from "@domain/entities/grocery-list.entity"
import { GroceryListEntity as GList } from "@domain/entities/grocery-list.entity"
import type { UserType } from "@domain/entities/user.entity"
import { GroceryListNotFoundError } from "@domain/errors/grocery-list.errors"
import { GroceryListRepository } from "@domain/repositories/grocery-list.repository"
import type { RepoResult, RepoUnitResult } from "@domain/utils"
import { DateTime } from "@domain/utils/refined-types"
import { desc, eq } from "drizzle-orm"
import type { ParseError } from "effect/ParseResult"
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
  ): Promise<RepoResult<GroceryListEntity, Error>> {
    try {
      const encoded = list.serialize().unwrap()

      const values = {
        ...encoded,
        id: list.id,
        userId: list.ownerId,
      } satisfies typeof groceryLists.$inferInsert

      const [inserted] = await this.db
        .insert(groceryLists)
        .values(values)
        .returning()

      if (!inserted) {
        return R.Err(new Error("Failed to create grocery list"))
      }

      return this.mapToEntity(inserted)
    } catch (error) {
      return R.Err(error as Error)
    }
  }

  async findById(
    id: GroceryListType["id"],
  ): Promise<RepoResult<GroceryListEntity, GroceryListNotFoundError>> {
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

      return this.mapToEntity(row)
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
  ): Promise<RepoUnitResult<GroceryListNotFoundError>> {
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

      // @ts-expect-error need to update UnitResult implementation
      return R.UNIT_RESULT
    } catch {
      return R.Err(new GroceryListNotFoundError(id))
    }
  }

  async findByUserId(
    userId: UserType["id"],
  ): Promise<RepoResult<GroceryListEntity[], ParseError[]>> {
    const results = await this.db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.userId, userId))
      .orderBy(desc(groceryLists.updatedAt))

    const lists = results.map((row) => this.mapToEntity(row))

    return R.all(...lists)
  }

  private mapToEntity(
    row: typeof groceryLists.$inferSelect,
  ): Result<GroceryListEntity, ParseError> {
    return GList.fromEncoded({
      id: row.id,
      name: row.name,
      description: row.description,
      ownerId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
