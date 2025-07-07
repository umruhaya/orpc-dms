import { parseErrorsToValidationError } from "@application/utils/validation-error.utils"
import { Result } from "@carbonteq/fp"
import {
  type GroceryListEncoded,
  GroceryListRepository,
  ResultUtils,
  type UserEntity,
  type ValidationError,
} from "@repo/domain"
import { inject, injectable } from "tsyringe"

@injectable()
export class GroceryListAppService {
  constructor(
    @inject(GroceryListRepository)
    private readonly groceryListRepo: GroceryListRepository,
  ) {}

  async findGroceryListsForUser(
    user: UserEntity,
  ): Promise<Result<{ lists: GroceryListEncoded[] }, ValidationError>> {
    const lists = await this.groceryListRepo.findByUserId(user.id)
    const listsEncoded = Result.all(...lists.map(ResultUtils.serialized))
      .mapErr(parseErrorsToValidationError)
      .map((lists) => ({ lists }))

    return listsEncoded
  }
}
