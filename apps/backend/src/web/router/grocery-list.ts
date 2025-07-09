import { GroceryListWorkflows } from "@application/workflows"
import { container } from "tsyringe"
import { authenticated } from "../utils/orpc"
import { handleAppResult } from "../utils/result-handler"

const base = authenticated.groceryList

const getListByIdHandler = base.getListById.handler(async () => {
  throw new Error("Not implemented yet")
})

const getStatsHandler = base.getStats.handler(async ({ context }) => {
  const groceryListFlows = container.resolve(GroceryListWorkflows)
  const result = await groceryListFlows.getDashboardStats(context.user)

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

const getListsHandler = base.getLists.handler(
  async ({ context: { user }, input }) => {
    const groceryListFlows = container.resolve(GroceryListWorkflows)
    const result = await groceryListFlows.getGroceryListsWithFilters(
      user,
      input,
    )

    return handleAppResult(result)
  },
)

export default base.router({
  getListById: getListByIdHandler,
  getStats: getStatsHandler,
  createGroceryList: createGroceryHandler,
  updateGroceryList: updateGroceryHandler,
  deleteGroceryList: deleteGroceryHandler,
  getLists: getListsHandler,
})
