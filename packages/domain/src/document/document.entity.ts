import { Option, type Result } from "@carbonteq/fp"
import { UserIdSchema, type UserType } from "@domain/user/user.entity"
import { BaseEntity, defineEntityStruct } from "@domain/utils/base.entity"
import { DateTime, UUID, Opt } from "@domain/utils/refined-types"
import { createEncoderDecoderBridge } from "@domain/utils/schema-utils"
import { Schema as S } from "effect"
import type { ParseError } from "effect/ParseResult"

export const DocumentId = UUID.pipe(S.brand("DocumentId"))
export const DocumentSchema = defineEntityStruct({
    id: DocumentId,
    createdBy: UserIdSchema,
    labels: S.Array(S.String.pipe(S.minLength(1), S.maxLength(64))), // exists at top level, not versioned
    
    // denormalize/calculated values (from the latest version, to enable search filters)
    currentVersion: Opt(S.NonNegativeInt),
    title: Opt(S.String.pipe(S.minLength(1), S.maxLength(64))),
    fileType: Opt(S.String.pipe(S.NullOr)),
})

// Create Schema
export const DocumentCreateSchema = DocumentSchema.pipe(
    S.pick("labels"),
)

// Update Schema
export const DocumentUpdateSchema = S.partialWith(
    DocumentSchema.pipe(
        S.pick("labels")
    ),
    { exact: true },
)

// CRUD Types
export type DocumentType = S.Schema.Type<typeof DocumentSchema>
export type DocumentEncoded = S.Schema.Encoded<
  typeof DocumentSchema
>
export type DocumentCreateData = S.Schema.Type<typeof DocumentCreateSchema>
export type DocumentUpdateData = S.Schema.Type<typeof DocumentUpdateSchema>

const bridge = createEncoderDecoderBridge(DocumentSchema)

export class DocumentEntity extends BaseEntity implements DocumentType {
    override readonly id: DocumentType["id"]
    readonly labels: DocumentType["labels"]
    readonly createdBy: DocumentType["createdBy"]
    readonly currentVersion: DocumentType["currentVersion"]
    readonly title: DocumentType["title"]
    readonly fileType: DocumentType["fileType"]

    private constructor(data: DocumentType) {
        super(data)
        this.id = data.id
        this.currentVersion = data.currentVersion
        this.labels = data.labels
        this.createdBy = data.createdBy
        this.title = data.title
        this.fileType = data.fileType
    }

    // Factory methods
    static create (
        data: DocumentCreateData,
        owner: UserType,
    ): DocumentEntity {
        const documentData: DocumentType = {
            ...data,
            id: DocumentId.make(UUID.new()),
            createdBy: owner.id,
            title: Option.None,
            fileType: Option.None, // bin as default
            currentVersion: Option.None,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
        }
        return new DocumentEntity(documentData)
    }

    // Factory methods for Reconstitution
    static from(data: DocumentType): DocumentEntity {
        return new DocumentEntity(data)
    }

    static fromEncoded(data: DocumentEncoded): Result<DocumentEntity, ParseError> {
        console.log({ data })
        const a = bridge.deserialize(data)
        console.log({ a: a.safeUnwrap() })
        const b = a.map(d => new DocumentEntity(d))
        console.log({ b })
        return b
    }

    // Standard Serialization method
    serialize() {
        return bridge.serialize(this)
    }

    // Helper Methods
    isCreatedBy(userId: UserType["id"]): boolean {
        return this.createdBy === userId
    }

    incrementVersion() {
        return this.currentVersion.map(currentVersion => new DocumentEntity({ ...this, currentVersion: currentVersion + 1 }))
    }
}