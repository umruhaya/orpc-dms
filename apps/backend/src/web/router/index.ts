import { authenticated } from "../utils/orpc"
import groceryListRouter from "./grocery-list"
import userRouter from "./user"
import documentRouter from "./document"

export const router = {
  authenticated: authenticated.router({
    user: userRouter,
    documents: documentRouter,
    groceryList: groceryListRouter,
  }),
}

export type BackendRouter = typeof router
