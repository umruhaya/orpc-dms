// biome-ignore lint/style/useImportType: Dependency injection
import { GroceryListAppService } from "@application/services/grocery-list.app-service"
import type { CreateGroceryListDto } from "@application/dtos/grocery-list.dto"
import { ApplicationResult } from "@application/utils/application-result.utils"
import {
  ResultUtils,
  type GroceryListEncoded,
  type UserEntity,
} from "@repo/domain"
import { autoInjectable } from "tsyringe"

export type DashboardStats = {
  totalLists: number
  recentLists: GroceryListEncoded[]
}

@autoInjectable()
export class GroceryListWorkflows {
  constructor(private readonly groceryListService: GroceryListAppService) {}

  async createGroceryList(
    _dto: CreateGroceryListDto,
  ): Promise<ApplicationResult<GroceryListEncoded>> {
    return ApplicationResult.Err(new Error("Not implemented yet"))
  }

  async listGroceryListsForUser(user: UserEntity) {
    const result = await this.groceryListService.findGroceryListsForUser(user)
    return ApplicationResult.fromResult(result)
  }

  async getDashboardData(
    user: UserEntity,
  ): Promise<ApplicationResult<DashboardStats>> {
    const listsResult =
      await this.groceryListService.findGroceryListsForUser(user)

    const stats = listsResult
      .map(({ lists }) => lists.slice(0, 4))
      .map((recentLists) => ({
        recentLists,
        totalLists: recentLists.length,
      }))

    return ApplicationResult.fromResult(stats)
  }

  async updateGroceryList(
    _request: unknown, // UpdateGroceryListDto - not implemented yet
  ): Promise<ApplicationResult<unknown>> {
    return ApplicationResult.Err(new Error("Not implemented yet"))
  }

  async deleteGroceryList(_listId: string): Promise<ApplicationResult<void>> {
    return ApplicationResult.Err(new Error("Not implemented yet"))
  }
}
