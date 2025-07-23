// import type { CreateDocumentDto } from "@application/dtos/document.dto"
import type { CreateDocumentDto } from "@application/dtos/document.dto"
import { ApplicationResult } from "@application/utils/application-result.utils"
import type { PaginatedResult } from "@application/utils/pagination.utils"
import { Result } from "@carbonteq/fp"
import { DocumentEntity, type DocumentType } from "@domain/document/document.entity"
import {
  type DocumentFindFilters,
  DocumentRepository,
} from "@domain/document/document.repository"
import type {
  GetDocumentSchema,
  PaginatedDocument,
  DocumentEncoded,
  DocumentsFilterParams,
} from "@domain/document/document.schemas"
import { DocumentService } from "@domain/document/document.service"
import type { UserEntity } from "@domain/user/user.entity"
import { ResultUtils } from "@domain/utils/fp-utils"
import { DateTime as DT } from "effect"
import { autoInjectable } from "tsyringe"

const sevenDaysAgo = () => {
  const date = new Date()
  date.setDate(date.getDate() - 7)

  return date
}

@autoInjectable()
export class DocumentWorkflows {
  constructor(
    private readonly DocumentRepo: DocumentRepository,
  ) {}

   async getDocumentsWithFilters(
    user: UserEntity,
    filters: DocumentsFilterParams,
  ): Promise<ApplicationResult<PaginatedDocument>> {
    const since = filters.sinceMs
      ? new Date(
          DT.unsafeNow().pipe(DT.subtract({ millis: filters.sinceMs }))
            .epochMillis,
        )
      : undefined

    const repoFilters: DocumentFindFilters = {
        ...filters,
        since,
        userId: user.id,
    }

    const docs = await this.DocumentRepo.findWithFilters(repoFilters)
    const encoded = docs.flatMap(ResultUtils.paginatedSerialize)
    return ApplicationResult.fromResult(encoded)
  }

  async createDocument(
    user: UserEntity,
    documentDto: CreateDocumentDto,
  ): Promise<ApplicationResult<DocumentEncoded>> {
    const doc = DocumentEntity.create(documentDto, user)
    const res = await this.DocumentRepo.create(doc)
    const encoded = res.flatMap(ResultUtils.serialized)
    // res.map(doc => this.DocumentRepo.createAccess())
    return ApplicationResult.fromResult(encoded)
  }
}
