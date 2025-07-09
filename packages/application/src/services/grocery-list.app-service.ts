import { parseErrorsToValidationError } from "@application/utils/validation-error.utils"
import { Result } from "@carbonteq/fp"
import type { DashboardStats } from "@contract/schemas/grocery-list"
// biome-ignore lint/style/useImportType: Dependency injection
import {
  type GroceryListEncoded,
  GroceryListRepository,
  ItemRepository,
  type UserEntity,
  type ValidationError,
} from "@repo/domain"
import { autoInjectable } from "tsyringe"

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

  async getStatsForUser(
    user: UserEntity,
  ): Promise<Result<DashboardStats, ValidationError>> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [totalLists, recentLists, activeItems, completedToday] =
      await Promise.all([
        this.groceryListRepo.count({ userId: user.id }),
        // Promise.resolve(0),
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
      activeItems,
      completedToday,
    }

    return Result.Ok(stats)
  }
}
