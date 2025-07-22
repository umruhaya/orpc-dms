import type { Result } from "@carbonteq/fp"
import { DocumentId } from "@domain/document/document.entity"
import { UserIdSchema } from "@domain/user/user.entity"
import { BaseEntity, defineEntityStruct } from "@domain/utils/base.entity"
import { DateTime, UUID } from "@domain/utils/refined-types"
import { createEncoderDecoderBridge } from "@domain/utils/schema-utils"
import { Schema as S } from "effect"
import type { ParseError } from "effect/ParseResult"

export const DocumentAccessId = UUID.pipe(S.brand("DocumentAccessId"))

export const RoleEnum = S.Enums({
  OWNER: "owner",
  EDITOR: "editor",
  VIEWER: "viewer",
})

export const DocumentAccessSchema = defineEntityStruct({
  id: DocumentAccessId,
  userId: UserIdSchema,
  documentId: DocumentId,
  role: RoleEnum,
})

export type DocumentAccessType = S.Schema.Type<typeof DocumentAccessSchema>
export type DocumentAccessEncoded = S.Schema.Encoded<
  typeof DocumentAccessSchema
>

export const DocumentAccessCreateSchema = DocumentAccessSchema.pipe(
  S.pick("userId", "documentId", "role"),
)

export type DocumentAccessCreateType = S.Schema.Type<
  typeof DocumentAccessCreateSchema
>

const bridge = createEncoderDecoderBridge(DocumentAccessSchema)

export class DocumentAccessEntity
  extends BaseEntity
  implements DocumentAccessType
{
  override readonly id: DocumentAccessType["id"]
  readonly userId: DocumentAccessType["userId"]
  readonly documentId: DocumentAccessType["documentId"]
  readonly role: DocumentAccessType["role"]

  private constructor(data: DocumentAccessType) {
    super(data)
    this.id = data.id
    this.userId = data.userId
    this.documentId = data.documentId
    this.role = data.role
  }

  static create(data: DocumentAccessCreateType): DocumentAccessEntity {
    return new DocumentAccessEntity({
      ...data,
      id: DocumentAccessId.make(UUID.new()),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
  }

  static from(data: DocumentAccessType): DocumentAccessEntity {
    return new DocumentAccessEntity(data)
  }

  static fromEncoded(
    data: DocumentAccessEncoded,
  ): Result<DocumentAccessEntity, ParseError> {
    return bridge.deserialize(data).map((d) => new DocumentAccessEntity(d))
  }

  serialize() {
    return bridge.serialize(this)
  }
}
