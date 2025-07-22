import { Result as R } from "@carbonteq/fp"
import type {
  GroceryListEntity,
  GroceryListType,
  GroceryListUpdateData,
} from "@domain/grocery-list/grocery-list.entity"
import { GroceryListEntity as GList } from "@domain/grocery-list/grocery-list.entity"
import { GroceryListNotFoundError } from "@domain/grocery-list/grocery-list.errors"
import {
  type GroceryListCountFilters,
  type GroceryListFindFilters,
  GroceryListRepository,
} from "@domain/grocery-list/grocery-list.repository"
import type { UserType } from "@domain/user/user.entity"
import { type RepoResult, type RepoUnitResult } from "@domain/utils"
import {
  calculateOffset,
  createPaginatedResult,
  getDefaultPagination,
  type Paginated,
} from "@domain/utils/pagination.utils"
import { DateTime } from "@domain/utils/refined-types"
import { and, asc, desc, eq, gte, ilike } from "drizzle-orm"
import { injectable } from "tsyringe"
import type { AppDatabase } from "../conn"
import { InjectDb } from "../conn"
import { schema } from "../schema"
import { enhanceEntityMapper } from "./repo.utils"

const { groceryLists } = schema

const mapper = enhanceEntityMapper((row: typeof groceryLists.$inferSelect) =>
  GList.fromEncoded({
    id: row.id,
    name: row.name,
    description: row.description,
    ownerId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    active: row.isActive,
  }),
)

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

      return mapper.mapOne(inserted)
    } catch (error) {
      return R.Err(error as Error)
    }
  }

  async findById(
    id: GroceryListType["id"],
  ): Promise<RepoResult<GroceryListEntity, GroceryListNotFoundError>> {
    try {
      const row = await this.db.query.groceryLists.findFirst({
        where: eq(groceryLists.id, id),
      })

      if (!row) {
        return R.Err(new GroceryListNotFoundError(id))
      }

      return mapper.mapOne(row)
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

      return R.UNIT_RESULT
    } catch {
      return R.Err(new GroceryListNotFoundError(id))
    }
  }

  async findByUserId(
    userId: UserType["id"],
  ): Promise<RepoResult<GroceryListEntity[]>> {
    const rows = await this.db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.userId, userId))
      .orderBy(desc(groceryLists.updatedAt))

    return mapper.mapMany(rows)
  }

  async findWithFilters(
    filters: GroceryListFindFilters,
  ): Promise<RepoResult<Paginated<GroceryListEntity>>> {
    const pagination = getDefaultPagination({
      page: filters.page,
      limit: filters.limit,
      sortOrder: filters.sortOrder,
    })

    const offset = calculateOffset(pagination.page, pagination.limit)

    const conditions = [eq(groceryLists.userId, filters.userId)]
    if (filters.search) {
      conditions.push(ilike(groceryLists.name, `%${filters.search}%`))
    }
    if (filters.status === "active") {
      conditions.push(eq(groceryLists.isActive, true))
    } else if (filters.status === "inactive") {
      conditions.push(eq(groceryLists.isActive, false))
    }
    if (filters.since) {
      conditions.push(gte(groceryLists.updatedAt, filters.since))
    }

    const orderBy =
      filters.sortBy === "name"
        ? pagination.sortOrder === "asc"
          ? asc(groceryLists.name)
          : desc(groceryLists.name)
        : pagination.sortOrder === "asc"
          ? asc(groceryLists.updatedAt)
          : desc(groceryLists.updatedAt)

    const totalCount = await this.db.$count(groceryLists, and(...conditions))

    const rows = await this.db
      .select()
      .from(groceryLists)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(offset)

    const listsResult = mapper.mapMany(rows)

    return listsResult.map((lists) =>
      createPaginatedResult(
        lists,
        totalCount,
        pagination.page,
        pagination.limit,
      ),
    )
  }

  async count(filters: GroceryListCountFilters): Promise<number> {
    const c = await this.db.$count(
      groceryLists,
      and(
        filters.userId ? eq(groceryLists.userId, filters.userId) : undefined,
        filters.since ? gte(groceryLists.updatedAt, filters.since) : undefined,
      ),
    )

    return c
  }
}
