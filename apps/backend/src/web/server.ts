// biome-ignore assist/source/organizeImports: Need reflect-metadata for decorators
import "reflect-metadata"

import { Hono } from "hono"
import { showRoutes } from "hono/dev"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { addOpenApiHandler } from "./utils/openapi.handler"
import { addRpcHandler } from "./utils/rpc.handler"
import { container } from "tsyringe"
import { initAuthRouter } from "./router/auth"
import config from "@/infra/config"
import { addOpenApiDocs } from "./utils/openapidocs.handler"
import { wireDi } from "@/infra/di"

wireDi()

// const groceryListService = container.resolve(GroceryListAppService)

const app = new Hono()
app.use(logger())
app.use(
  "/*",
  cors({
    origin: [
      config.app.TRUSTED_ORIGIN,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Set-Cookie",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    exposeHeaders: ["Set-Cookie"],
  }),
)

await addOpenApiDocs(app, container)
initAuthRouter(app, container)
addRpcHandler(app, container)
await addOpenApiHandler(app, container)

if (config.app.NODE_ENV === "development") {
  showRoutes(app, { verbose: true })
}

export default {
  fetch: app.fetch,
  port: config.app.PORT,
}
