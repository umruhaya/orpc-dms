import { GroceryListAppService } from "@application/services"
import { container } from "tsyringe"
import { registerRepositories } from "../db/repos/di"

const services = [GroceryListAppService] as const

export const wireDi = () => {
  registerRepositories()

  // register application services
  for (const service of services) {
    container.registerSingleton(service, service)
  }
}
