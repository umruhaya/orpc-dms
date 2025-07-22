import { SQL } from "bun"
import { type BunSQLDatabase, drizzle } from "drizzle-orm/bun-sql"
import {
  container,
  type DependencyContainer,
  type FactoryProvider,
  inject,
  instanceCachingFactory,
} from "tsyringe"
import config from "@/infra/config"

import { schema } from "./schema"

export const createDbInstance = () => {
  const client = new SQL(config.db.DB_URL, {
    max: 25, // Reduced from 25 to avoid connection limit issues
    idleTimeout: 60, // Close idle connections after 60 seconds
  })

  const db = drizzle({
    client,
    schema,
    logger: config.app.NODE_ENV === "development",
  })

  return db
}

const DbSym = Symbol.for("Database")
export type AppDatabase = BunSQLDatabase<typeof schema>

export const DbProvider: FactoryProvider<AppDatabase> = {
  useFactory: instanceCachingFactory(createDbInstance),
}

container.register(DbSym, DbProvider)

export const InjectDb = () => inject(DbSym)
export const resolveDb = () => container.resolve(DbSym) as AppDatabase
export const resolveDbFromContainer = (depcontainer: DependencyContainer) =>
  depcontainer.resolve(DbSym) as AppDatabase
