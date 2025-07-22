import { DocumentVersionSchema } from "@domain/document-version/document-version.entity"
import { UserSchema } from "@domain/user/user.entity"
import {
  PaginatedResultSchema,
  PaginationParamsSchema,
} from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

const documentVersions = DocumentVersionSchema

export type DocumentVersionEncoded = Omit<
  S.Schema.Encoded<typeof documentVersions>,
  "createdAt" | "updatedAt"
> & {
  createdAt: number | string
  updatedAt: number | string
}

export const GetDocumentVersionsParamsSchema = PaginationParamsSchema.pipe(
  S.extend(
    S.Struct({
      search: S.optional(S.String),
      sinceMs: S.optional(S.Number.pipe(S.int(), S.positive())),
    }),
  ),
)

export const GetDocumentVersionsResultSchema = PaginatedResultSchema(documentVersions)

export const DocumentVersionDetailsSchema = DocumentVersionSchema.pipe(
  S.omit("contentUri"),
  S.extend(
    S.Struct({
      content: S.String,
      stats: S.Struct({
        totalItems: S.Number,
      }),
    }),
  ),
)

export type DocumentVersionDetails = S.Schema.Encoded<
  typeof DocumentVersionDetailsSchema
>
export type GetDocumentVerionsParams = S.Schema.Type<typeof GetDocumentVersionsParamsSchema>
export type GetDocumentVerionsResult = S.Schema.Encoded<typeof GetDocumentVersionsResultSchema>
