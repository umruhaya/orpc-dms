import { DocumentSchema } from "@domain/document/document.entity"
import { UserSchema } from "@domain/user/user.entity"
import {
  PaginatedResultSchema,
  PaginationParamsSchema,
} from "@domain/utils/pagination.utils"
import { Schema as S } from "effect"

const list = DocumentSchema.pipe(S.omit("createdBy"))

export type DocumentEncoded = Omit<
  S.Schema.Encoded<typeof list>,
  "createdAt" | "updatedAt"
> & {
  createdAt: number | string
  updatedAt: number | string
}

export const GetListsParamsSchema = PaginationParamsSchema.pipe(
  S.extend(
    S.Struct({
      search: S.optional(S.String),
      sinceMs: S.optional(S.Number.pipe(S.int(), S.positive())),
    }),
  ),
)

export const GetListsResultSchema = PaginatedResultSchema(list)

export const DocumentDetailsSchema = DocumentSchema.pipe(
  S.omit("createdBy"),
  S.extend(
    S.Struct({
      owner: UserSchema,
      stats: S.Struct({
        totalItems: S.Number,
      }),
    }),
  ),
)

export type DocumentDetails = S.Schema.Encoded<
  typeof DocumentDetailsSchema
>

export type GetListsParams = S.Schema.Encoded<typeof GetListsParamsSchema>
export type GetListsResult = S.Schema.Encoded<typeof GetListsResultSchema>
