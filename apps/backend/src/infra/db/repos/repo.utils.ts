import type { Result } from "@carbonteq/fp"
import { ResultUtils, ValidationError } from "@domain/utils"
import { parseErrorToValidationError } from "@domain/utils/valdidation.utils"
import type { ParseError } from "effect/ParseResult"

type EntityMapper<T, U> = (data: T) => Result<U, ParseError>

export const enhanceEntityMapper = <T, U, E>(fn: EntityMapper<T, U>) => {
  const mapOne = (data: T): Result<U, ValidationError> =>
    fn(data).mapErr(parseErrorToValidationError)

  const mapMany = (data: T[]): Result<U[], ValidationError> => {
    const entities = data.map(fn)

    return ResultUtils.mapParseErrors(entities)
  }

  return { mapOne, mapMany } as const
}
