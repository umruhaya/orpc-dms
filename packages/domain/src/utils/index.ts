import type { Result, UnitResult } from "@carbonteq/fp"
import type { ParseError } from "effect/ParseResult"

export * from "./base.entity"
export * from "./base.errors"
export { ResultUtils } from "./fp-utils"
export * from "./pagination.utils"
export * from "./refined-types"
export * from "./schema-utils"

type RepoErrors = ParseError | ParseError[]
export type RepoResult<T, E = RepoErrors> = Result<T, E | RepoErrors>
export type RepoUnitResult<E = RepoErrors> = UnitResult<E | RepoErrors>
