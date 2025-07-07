import { GroceryListRepository } from "@domain/repositories/grocery-list.repository"
import { container } from "tsyringe"
import { asImplementation } from "@/infra/di/utils"
import { DrizzleGroceryListRepository } from "./grocery-list.repository"

const repos = [
  [GroceryListRepository, DrizzleGroceryListRepository],
  //
] as const

export const registerRepositories = () => {
  for (const [token, impl] of repos) {
    container.register(...asImplementation(token, impl))
  }
}
