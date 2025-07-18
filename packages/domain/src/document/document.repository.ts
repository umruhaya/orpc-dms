import type { UserType } from "@domain/user/user.entity"
import type { RepoResult, RepoUnitResult } from "@domain/utils"
import type { Paginated } from "@domain/utils/pagination.utils"
import type {
  DocumentEntity,
  DocumentType,
  DocumentUpdateData,
} from "./document.entity"
import type { DocumentNotFoundError } from "./document.errors"

export type DocumentCountFilters = {
  userId?: UserType["id"]
  since?: Date
}

export type DocumentFindFilters = {
  userId: UserType["id"]
  title?: string
  tags?: string[]
  fileType: string
  since?: Date
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export abstract class DocumentRepository {
  abstract create(
    list: DocumentEntity,
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
  abstract findByUserId(
    userId: UserType["id"],
  ): Promise<RepoResult<DocumentEntity[]>>
  abstract findWithFilters(
    filters: DocumentFindFilters,
  ): Promise<RepoResult<Paginated<DocumentEntity>>>
  abstract count(filters: DocumentCountFilters): Promise<number>
}
