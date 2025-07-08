import { GroceryListWorkflows } from "@application/workflows"
import { container } from "tsyringe"
import { authenticated } from "../utils/orpc"
import { handleAppResult } from "../utils/result-handler"

const base = authenticated.groceryList

const getListByIdHandler = base.getListById.handler(async () => {
  throw new Error("Not implemented yet")
})

const getRecentListsHandler = base.getRecentLists.handler(
  async ({ context }) => {
    console.debug("Attempting to fetch recent lists for user", context.user.id)

    try {
      const groceryListFlows = container.resolve(GroceryListWorkflows)
      console.debug("Resolved GroceryListWorkflows from container")

      const result = await groceryListFlows.listGroceryListsForUser(
        context.user,
      )

      console.debug("Received result from GroceryListWorkflows", result)
      if (result.isOk()) {
        console.debug(result.unwrap())
      } else {
        console.error(
          "Error in GroceryListWorkflows result:",
          result.unwrapErr(),
        )
      }
      const data = handleAppResult(result)

      return data
    } catch (err) {
      console.error("Error fetching recent lists:", err)
    }
  },
)

const getStatsHandler = base.getStats.handler(async ({ context }) => {
  const groceryListFlows = container.resolve(GroceryListWorkflows)
  const result = await groceryListFlows.getDashboardData(context.user)

  return handleAppResult(result)
})

const createGroceryHandler = base.createGroceryList.handler(async () => {
  throw new Error("Not implemented yet")
})

const updateGroceryHandler = base.updateGroceryList.handler(
  async ({ input, context }) => {
    throw new Error("Not implemented yet")
  },
)

const deleteGroceryHandler = base.deleteGroceryList.handler(
  async ({ input, context }) => {
    throw new Error("Not implemented yet")
  },
)

export default base.router({
  getListById: getListByIdHandler,
  getRecentLists: getRecentListsHandler,
  getStats: getStatsHandler,
  createGroceryList: createGroceryHandler,
  updateGroceryList: updateGroceryHandler,
  deleteGroceryList: deleteGroceryHandler,
})
