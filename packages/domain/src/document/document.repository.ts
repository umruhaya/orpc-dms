import type { UserType } from "@domain/user/user.entity"
import type { RepoResult, RepoUnitResult } from "@domain/utils"
import type { Paginated } from "@domain/utils/pagination.utils"
import type {
  DocumentEntity,
  DocumentType,
  DocumentUpdateData,
} from "./document.entity"
import type { DocumentNotFoundError } from "./document.errors"
import type { DocumentVersionEntity } from "@domain/document-version/document-version.entity"
import type { DocumentVersionNotFoundError } from "@domain/document-version/document-version.errors"

export type DocumentCountFilters = {
  userId?: UserType["id"]
  since?: Date
}

export type DocumentFindFilters = {
  userId: UserType["id"]
  tags?: string[]
  since?: Date
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type DocumentVersionFilters = {
  documentId: DocumentType['id']
  page?: number
  limit?: number
}

export abstract class DocumentRepository {
  abstract create(
    document: DocumentEntity,
  ): Promise<RepoResult<DocumentEntity, Error>>

  abstract findById(
    id: DocumentType["id"],
  ): Promise<RepoResult<DocumentEntity, DocumentNotFoundError>>

  abstract update(
    id: DocumentType["id"],
    updates: DocumentUpdateData,
  ): Promise<void>

  abstract delete(
    id: DocumentType["id"],
  ): Promise<RepoUnitResult<DocumentNotFoundError>>

  abstract findWithFilters(
    filters: DocumentFindFilters,
  ): Promise<RepoResult<Paginated<DocumentEntity>>>

  abstract count(filters: DocumentCountFilters): Promise<number>

  abstract addVersion(
    document: DocumentEntity, 
    documentVersion: DocumentVersionEntity
  ): Promise<RepoResult<DocumentVersionEntity>>

  abstract getVersion(
    documentId: DocumentVersionEntity["id"], 
    version: DocumentVersionEntity["version"]
  ): Promise<RepoResult<DocumentVersionEntity, DocumentVersionNotFoundError>>

  abstract getLatestVersion(
    documentId: DocumentVersionEntity["id"], 
  ): Promise<RepoResult<DocumentVersionEntity, DocumentVersionNotFoundError>>

  abstract listVersions(
    documentVersionFilters :DocumentVersionFilters, 
  ): Promise<RepoResult<Paginated<DocumentVersionEntity>>>
}
