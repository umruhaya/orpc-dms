import { parseErrorsToValidationError } from "@application/utils/validation-error.utils"
import { Result } from "@carbonteq/fp"
import type {
  DashboardStats,
  GetListsParamsType,
} from "@contract/schemas/grocery-list"
import type { PaginatedResult } from "@domain/utils/pagination.utils"
// biome-ignore lint/style/useImportType: Dependency injection
import {
  type GroceryListEncoded,
  type GroceryListFindFilters,
  GroceryListRepository,
  ItemRepository,
  type UserEntity,
  type ValidationError,
} from "@repo/domain"
import { DateTime as DT } from "effect"
import { autoInjectable } from "tsyringe"

export type { GetListsParamsType }

@autoInjectable()
export class GroceryListAppService {
  constructor(
    private readonly groceryListRepo: GroceryListRepository,
    private readonly itemRepo: ItemRepository,
  ) {}

  async findGroceryListsForUser(
    user: UserEntity,
  ): Promise<Result<{ lists: GroceryListEncoded[] }, ValidationError>> {
    const lists = await this.groceryListRepo.findByUserId(user.id)
    const listsEncoded = lists
      .flatMap((lists) => Result.all(...lists.map((l) => l.serialize())))
      .mapErr(parseErrorsToValidationError)
      .map((lists) => ({ lists }))

    return listsEncoded
  }

  async findGroceryListsWithFilters(
    user: UserEntity,
    filters: GetListsParamsType,
  ): Promise<Result<PaginatedResult<GroceryListEncoded>, ValidationError>> {
    const since = filters.sinceMs
      ? new Date(
          DT.unsafeNow().pipe(DT.subtract({ millis: filters.sinceMs }))
            .epochMillis,
        )
      : undefined

    const repoFilters: GroceryListFindFilters = {
      userId: user.id,
      search: filters.search,
      status: filters.status,
      since,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }
    const result = await this.groceryListRepo.findWithFilters(repoFilters)

    return result
      .flatMap((paginatedResult) => {
        const serializedItems = Result.all(
          ...paginatedResult.items.map((item) => item.serialize()),
        )
        return serializedItems.map((items) => ({
          ...paginatedResult,
          items,
        }))
      })
      .mapErr(parseErrorsToValidationError)
  }

  async getStatsForUser(
    user: UserEntity,
  ): Promise<Result<DashboardStats, ValidationError>> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [totalLists, recentLists, pendingItems, completedToday] =
      await Promise.all([
        this.groceryListRepo.count({ userId: user.id }),
        this.groceryListRepo.count({ userId: user.id, since: sevenDaysAgo }),
        this.itemRepo.count({ userId: user.id, status: "pending" }),
        this.itemRepo.count({
          userId: user.id,
          status: "bought",
          updatedSince: startOfToday,
        }),
      ])

    const stats: DashboardStats = {
      totalLists,
      recentLists,
      pendingItems,
      completedToday,
    }

    return Result.Ok(stats)
  }
}
