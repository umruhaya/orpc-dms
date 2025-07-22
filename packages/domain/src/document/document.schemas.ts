import { DocumentSchema } from "@domain/document/document.entity"
import { UserSchema } from "@domain/user/user.entity"
import {
  PaginatedResultSchema,
  PaginationParamsSchema,
} from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

const documents = DocumentSchema.pipe(S.omit("createdBy"))

export type DocumentEncoded = Omit<
  S.Schema.Encoded<typeof documents>,
  "createdAt" | "updatedAt"
> & {
  createdAt: number | string
  updatedAt: number | string
}

export const GetDocumentsParamsSchema = PaginationParamsSchema.pipe(
  S.extend(
    S.Struct({
      title: S.optional(S.String),
      fileType: S.optional(S.String),
      sinceMs: S.optional(S.Number.pipe(S.int(), S.positive())),
    }),
  ),
)

export const GetDocumentsResultSchema = PaginatedResultSchema(documents)
export const DocumentDetailsSchema = DocumentSchema.pipe(
  S.omit("createdBy"),
  S.extend(
    S.Struct({
      originalAuthor: UserSchema,
      stats: S.Struct({
        totalItems: S.Number,
      }),
    }),
  ),
)

export type DocumentDetails = S.Schema.Encoded<
  typeof DocumentDetailsSchema
>

export type GetDocumentsParams = S.Schema.Type<typeof GetDocumentsParamsSchema>
export type GetDocumentsResult = S.Schema.Encoded<typeof GetDocumentsResultSchema>
