import type { CreateGroceryListDto } from "@application/dtos/grocery-list.dto"
// biome-ignore lint/style/useImportType: Dependecy injection
import { GroceryListAppService } from "@application/services/grocery-list.app-service"
import { ApplicationResult } from "@application/utils/application-result.utils"
import type { DashboardStats } from "@contract/schemas/grocery-list"
import type { GroceryListEncoded, UserEntity } from "@repo/domain"
import { autoInjectable } from "tsyringe"

@autoInjectable()
export class GroceryListWorkflows {
  constructor(private readonly groceryListService: GroceryListAppService) {}

  async createGroceryList(
    _dto: CreateGroceryListDto,
  ): Promise<ApplicationResult<GroceryListEncoded>> {
    return ApplicationResult.Err(new Error("Not implemented yet"))
  }

  async fetchGroceryListsForUser(user: UserEntity) {
    const result = await this.groceryListService.findGroceryListsForUser(user)
    return ApplicationResult.fromResult(result)
  }

  async getDashboardStats(
    user: UserEntity,
  ): Promise<ApplicationResult<DashboardStats>> {
    const statsResult = await this.groceryListService.getStatsForUser(user)

    return ApplicationResult.fromResult(statsResult)
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
