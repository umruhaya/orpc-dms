import type { DateTimeEncoded, UUIDType } from "@domain/utils/refined-types"
import { type SQL } from "drizzle-orm"
import { timestamp, uuid } from "drizzle-orm/pg-core"

// simple branded type occurs only at the type level
export const getUUIDKeyCol = <T extends UUIDType = UUIDType>() =>
  uuid("id").$type<T>().defaultRandom()

export const getPrimaryKeyCol = <T extends UUIDType = UUIDType>() =>
  uuid("id").$type<T>().primaryKey().defaultRandom()

export const getBaseColumns = <T extends UUIDType = UUIDType>() => ({
  id: getPrimaryKeyCol<T>(),
  createdAt: timestamp("created_at")
    .$type<DateTimeEncoded>()
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at")
    .$type<DateTimeEncoded>()
    .notNull()
    .defaultNow(),
})

export type FilterMappers<F, C> = {
  [K in keyof F]?: (value: NonNullable<F[K]>) => C | undefined
}

export const buildFilterConditions = <
  F extends Record<string, unknown>,
  C extends SQL<unknown>,
>(
  filters: F,
  mappers: FilterMappers<F, C>,
): C[] => {
  const conditions: C[] = []
  for (const key of Object.keys(mappers) as (keyof F)[]) {
    const mapper = mappers[key]
    if (!mapper) continue
    const value = filters[key]
    if (value !== undefined && value !== null) {
      const condition = mapper(value as NonNullable<F[typeof key]>)
      if (condition !== undefined) {
        conditions.push(condition)
      }
    }
  }
  return conditions
}