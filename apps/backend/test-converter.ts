import { DateTime } from "@domain/utils/refined-types"
import { JSONSchema, Schema as S } from "effect"
import { convertEffectSchemaToOpenAPI } from "./src/web/utils/effect-schema-converter"

const schema = S.Struct({
  name: S.String.pipe(S.minLength(1)),
  age: S.OptionFromNullOr(S.Number.pipe(S.greaterThan(0))),
  foo: S.Null,
  bar: DateTime,
})

console.debug(JSONSchema.make(schema))

// Test the converter with a simple schema
// const schema = S.String
// const result = convertEffectSchemaToOpenAPI(schema)

// console.log("Result:", JSON.stringify(result, null, 2))
