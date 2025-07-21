import type { ContractRouterClient } from "@orpc/contract"
import documentContract from "./documents"
import groceryListContract from "./grocery-list"
import userContract from "./user"

export const CONTRACT = {
  authenticated: {
    user: userContract,
    documents: documentContract,
    groceryList: groceryListContract,
  },
}

export type AppRouterClient = ContractRouterClient<typeof CONTRACT>
