import { eitherToResult } from "@domain/utils/fp-utils"
import { parseErrorToValidationError } from "@domain/utils/valdidation.utils"
import { Schema as S } from "effect"

export const validateWithEffect = <In, Out>(
  schema: S.Schema<Out, In>,
  data: unknown,
) => {
  return eitherToResult(
    S.decodeUnknownEither(schema)(data, {
      errors: "all",
      onExcessProperty: "ignore",
      exact: true,
    }),
  ).mapErr(parseErrorToValidationError)
}
