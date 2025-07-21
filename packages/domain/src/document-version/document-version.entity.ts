import type { Result } from "@carbonteq/fp"
import { DocumentId, } from "@domain/document/document.entity"
import { BaseEntity, defineEntityStruct } from "@domain/utils/base.entity"
import { DateTime, UUID, Opt } from "@domain/utils/refined-types"
import { createEncoderDecoderBridge } from "@domain/utils/schema-utils"
import { Schema as S } from "effect"
import type { ParseError } from "effect/ParseResult"

export const DocumentVersionSchema = defineEntityStruct({
    id: DocumentId,
    version: S.NonNegativeInt,
    title: S.String.pipe(S.minLength(1), S.maxLength(64)),
    description: Opt(S.String.pipe(S.maxLength(1024))),
    fileType: S.String,
    contentUri: S.String,
})

// Create Schema
export const DocumentVersionCreateSchema = DocumentVersionSchema.pipe(
    S.pick("id","version" ,"title", "description", "fileType", "contentUri"),
)

// No Update Schema, Since this resource is Immutable

// CRUD Types
export type DocumentVersionType = S.Schema.Type<typeof DocumentVersionSchema>
export type DocumentVersionCreateData = S.Schema.Type<typeof DocumentVersionCreateSchema>

const bridge = createEncoderDecoderBridge(DocumentVersionSchema)

export class DocumentVersionEntity extends BaseEntity implements DocumentVersionType {
    override readonly id: DocumentVersionType["id"]
    readonly version: DocumentVersionType["version"]

    readonly title: DocumentVersionType["title"]
    readonly description: DocumentVersionType["description"]
    readonly fileType: DocumentVersionType["fileType"]
    readonly contentUri: DocumentVersionType["contentUri"]

    private constructor(data: DocumentVersionType) {
        super(data)
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.version = data.version
        this.fileType = data.fileType
        this.contentUri = data.contentUri
    }

    // Factory methods
    static create (
        data: DocumentVersionCreateData,
    ): DocumentVersionEntity {
        const documentData: DocumentVersionType = {
            ...data,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
        }
        return new DocumentVersionEntity(documentData)
    }

    // Factory methods for Reconstitution
    static from(data: DocumentVersionType): DocumentVersionEntity {
        return new DocumentVersionEntity(data)
    }

    static fromEncoded(data: DocumentVersionType): Result<DocumentVersionEntity, ParseError> {
        return bridge.deserialize(data).map(d => new DocumentVersionEntity(d))
    }

    // Standard Serialization method
    serialize() {
        return bridge.serialize(this)
    }
}