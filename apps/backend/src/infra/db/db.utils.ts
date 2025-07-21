import type { DateTimeEncoded, UUIDType } from "@domain/utils/refined-types"
import { timestamp, uuid } from "drizzle-orm/pg-core"

// simple branded type occurs only at the type level
export const getUUIDKeyCol = <T extends UUIDType = UUIDType>() =>
  uuid("id").$type<T>().defaultRandom()

export const getPrimaryKeyCol = <T extends UUIDType = UUIDType>() =>
  uuid("id").$type<T>().primaryKey().defaultRandom()

// export const dateTimeCol = customType<{
//   driverData: DateTimeEncoded
//   data: DateTimeType
// }>({
//   dataType() {
//     return "timestamp"
//   },
//   fromDriver(value) {
//     console.debug("Deserializing DateTime from driver:", value)
//     return DateTime.bridge.deserialize(value).unwrap()
//   },
//   toDriver(value) {
//     console.debug("Serializing DateTime to driver:", value)
//     return DateTime.bridge.serialize(value).unwrap()
//   },
// })

// export const dateTimeColWithDefault = (name: string) =>
//   dateTimeCol(name).$defaultFn(() => DateTime.now())

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
  // createdAt: dateTimeColWithDefault("created_at").notNull(),
  // updatedAt: dateTimeColWithDefault("updated_at").notNull(),
})
