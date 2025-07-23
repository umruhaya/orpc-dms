import { DocumentSchema } from "@domain/document/document.entity"
import {
  PaginatedResultSchema,
  PaginationParamsSchema,
} from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

// This properly handles encoding values as `T | null` instead of Option object `{ value?: T }`
export const GetDocumentSchema = DocumentSchema.pipe(
  S.omit("title", "fileType", "currentVersion"),
  S.extend(
    S.Struct({
      currentVersion: S.NullOr(S.NonNegativeInt),
      title: S.NullOr(S.String.pipe(S.minLength(1), S.maxLength(64))),
      fileType: S.NullOr(S.String.pipe(S.NullOr)),
    })
  )
)

export type DocumentEncoded = S.Schema.Encoded<typeof DocumentSchema>

export const DocumentsFilterParamsSchema = PaginationParamsSchema.pipe(
  S.extend(
    S.Struct({
      title: S.optional(S.String),
      fileType: S.optional(S.String),
      sinceMs: S.optional(S.Number.pipe(S.int(), S.positive())),
    }),
  ),
)

export type DocumentsFilterParams = S.Schema.Type<typeof DocumentsFilterParamsSchema>

export const PaginatedDocumentSchema = PaginatedResultSchema(GetDocumentSchema)

export type PaginatedDocument = S.Schema.Encoded<typeof PaginatedDocumentSchema>