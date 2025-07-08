import { parseErrorsToValidationError } from "@application/utils/validation-error.utils"
import { Result } from "@carbonteq/fp"
// biome-ignore lint/style/useImportType: Dependency injection
import {
  type GroceryListEncoded,
  GroceryListRepository,
  type UserEntity,
  type ValidationError,
} from "@repo/domain"
import { autoInjectable } from "tsyringe"

@autoInjectable()
export class GroceryListAppService {
  constructor(private readonly groceryListRepo: GroceryListRepository) {}

  async findGroceryListsForUser(
    user: UserEntity,
  ): Promise<Result<{ lists: GroceryListEncoded[] }, ValidationError>> {
    const lists = await this.groceryListRepo.findByUserId(user.id)
    const listsEncoded = lists
    .flatMap(lists => Result.all(...lists.map(l => l.serialize())))
      .mapErr(parseErrorsToValidationError)
      .map((lists) => ({ lists }))

    return listsEncoded
  }
}
