import { account, session, user, verification } from "./models/auth.model.ts"
import { document, documentRelations } from "./models/document.model.ts"
import {
  documentAccess,
  documentAccessRelations,
} from "./models/document-access.model.ts"
import {
  documentVersion,
  documentVersionRelations,
} from "./models/doucment-version.model.ts"
import {
  groceryListItems,
  groceryListItemsRelations,
  groceryLists,
  groceryListsRelations,
} from "./models/grocery-list.model.ts"

export * from "./models/auth.model.ts"
export * from "./models/document.model.ts"
export * from "./models/doucment-version.model.ts"
export * from "./models/document-access.model.ts"
export * from "./models/grocery-list.model.ts"

// Export a single schema object combining all your table and relations definitions.
export const schema = {
  // Auth models
  user,
  account,
  session,
  verification,

  // Document models
  document,
  documentRelations,
  documentAccess,
  documentAccessRelations,
  documentVersion,
  documentVersionRelations,

  // Grocery List models
  groceryListItems,
  groceryLists,
  groceryListItemsRelations,
  groceryListsRelations,
}