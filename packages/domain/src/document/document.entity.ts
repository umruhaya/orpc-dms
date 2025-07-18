import type { Result } from "@carbonteq/fp"
import { UserIdSchema, type UserType } from "@domain/user/user.entity"
import { BaseEntity, defineEntityStruct } from "@domain/utils/base.entity"
import { DateTime, UUID, Opt } from "@domain/utils/refined-types"
import { createEncoderDecoderBridge } from "@domain/utils/schema-utils"
import { Schema as S } from "effect"
import type { ParseError } from "effect/ParseResult"

export const DocumentId = UUID.pipe(S.brand("DocumentId"))
export const DocumentSchema = defineEntityStruct({
    id: DocumentId,
    title: S.String.pipe(S.minLength(1), S.maxLength(64)),
    description: Opt(S.String.pipe(S.maxLength(1024))),
    fileType: S.String,
    tags: S.Array(S.String.pipe(S.minLength(1), S.maxLength(64))),
    createdBy: UserIdSchema,
})

// Create Schema
export const DocumentCreateSchema = DocumentSchema.pipe(
    S.pick("title", "description", "fileType", "tags", "createdBy"),
)

// Update Schema
export const DocumentUpdateSchema = S.partialWith(
    DocumentSchema.pipe(
        S.pick("title", "description", "fileType", "tags")
    ),
    { exact: true },
)

// CRUD Types
export type DocumentType = S.Schema.Type<typeof DocumentSchema>
export type DocumentCreateData = S.Schema.Type<typeof DocumentCreateSchema>
export type DocumentUpdateData = S.Schema.Type<typeof DocumentUpdateSchema>

const bridge = createEncoderDecoderBridge(DocumentSchema)

export class DocumentEntity extends BaseEntity implements DocumentType {
    override readonly id: DocumentType["id"]

    readonly title: DocumentType["title"]
    readonly description: DocumentType["description"]
    readonly fileType: DocumentType["fileType"]
    readonly tags: DocumentType["tags"]
    readonly createdBy: DocumentType["createdBy"]

    private constructor(data: DocumentType) {
        super(data)
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.fileType = data.fileType
        this.tags = data.tags
        this.createdBy = data.createdBy
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
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
        }
        return new DocumentEntity(documentData)
    }

    // Factory methods for Reconstitution
    static from(data: DocumentType): DocumentEntity {
        return new DocumentEntity(data)
    }

    static fromEncoded(data: DocumentType): Result<DocumentEntity, ParseError> {
        return bridge.deserialize(data).map(d => new DocumentEntity(d))
    }

    // Standard Serialization method
    serialize() {
        return bridge.serialize(this)
    }

    // Helper Methods
    isCreatedBy(userId: UserType["id"]): boolean {
        return this.createdBy === userId
    }
}