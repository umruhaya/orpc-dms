import { Option, Result as R } from "@carbonteq/fp"
import {
  DocumentEntity,
  type DocumentType,
  type DocumentUpdateData,
} from "@domain/document/document.entity"
import { DocumentNotFoundError } from "@domain/document/document.errors"
import { DocumentRepository, type DocumentFindFilters } from "@domain/document/document.repository"
import { DocumentAccessEntity } from "@domain/document-access/document-access.entity"
import { DocumentVersionEntity } from "@domain/document-version/document-version.entity"
import { type RepoResult, type RepoUnitResult } from "@domain/utils"
import {
  PaginationUtils,
  type Paginated,
} from "@domain/utils/pagination.utils"
import { DateTime } from "@domain/utils/refined-types"
import { and, asc, desc, eq, gte, ilike, arrayContains, countDistinct, exists } from "drizzle-orm"
import { injectable } from "tsyringe"
import type { AppDatabase } from "../conn"
import { InjectDb } from "../conn"
import { schema } from "../schema"
import { enhanceEntityMapper } from "./repo.utils"
import { buildFilterConditions } from "../db.utils"

const docMapper = enhanceEntityMapper(
  (row: typeof schema.document.$inferSelect) => DocumentEntity.fromEncoded(row),
)
const docVersionMapper = enhanceEntityMapper(
  (row: typeof schema.documentVersion.$inferSelect) => DocumentVersionEntity.fromEncoded(row),
)
const docAccessMapper = enhanceEntityMapper(
  (row: typeof schema.documentAccess.$inferSelect) => DocumentAccessEntity.fromEncoded(row),
)

@injectable()
export class DrizzleDocumentRepository extends DocumentRepository {
  constructor(@InjectDb() private readonly db: AppDatabase) {
    super()
  }

  override async create(
    doc: DocumentEntity,
  ): Promise<RepoResult<DocumentEntity, Error>> {
    try {
      const encoded = doc.serialize().unwrap()

      const values = {
        ...encoded,
        id: doc.id,
        createdBy: doc.createdBy,
        labels: [...encoded.labels],
        createdAt: new Date(doc.createdAt.epochMillis),
        updatedAt: new Date(doc.updatedAt.epochMillis),
      } satisfies typeof schema.document.$inferInsert

      console.log({values})

      const [inserted] = await this.db
        .insert(schema.document)
        .values(values)
        .returning()

      if (!inserted) {
        return R.Err(new Error("Failed to create grocery list"))
      }

      return docMapper.mapOne(inserted)
    } catch (error) {
      return R.Err(error as Error)
    }
  }

  override async findById(
    id: DocumentType["id"],
  ): Promise<RepoResult<DocumentEntity, DocumentNotFoundError>> {
    const row = await this.db.query.document.findFirst({
      where: eq(schema.document.id, id),
    })
    if (!row) {
      return R.Err(new DocumentNotFoundError(id))
    }
    return docMapper.mapOne(row)
  }

  override async update(
    id: DocumentType["id"],
    updates: DocumentUpdateData,
  ): Promise<void> {
    await this.db
      .update(schema.document)
      .set({
        ...updates,
        labels: updates.labels ? [...updates.labels] : undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.document.id, id))
  }

  override async delete(
    id: DocumentType["id"],
  ): Promise<RepoUnitResult<DocumentNotFoundError>> {
    const result = await this.db
      .delete(schema.document)
      .where(eq(schema.document.id, id))
      .returning({ id: schema.document.id })

    if (result.length === 0) {
      return R.Err(new DocumentNotFoundError(id))
    }

    return R.UNIT_RESULT
  }

  override async findWithFilters(filters: DocumentFindFilters): Promise<RepoResult<Paginated<DocumentEntity>>> {

      const conditions = buildFilterConditions(filters, {
        userId: userId => exists(
                this.db.select()
                    .from(schema.documentAccess)
                    .where(
                        and(
                            eq(schema.documentAccess.userId, userId),
                            eq(schema.documentAccess.documentId, schema.document.id), 
                        )
                    )   
        ),
        tags: labels => arrayContains(schema.document.labels, labels),
        since: (date) => gte(schema.document.updatedAt, date),
      })

      const { limit, offset, page } = PaginationUtils.getDefaultPagination(filters)

        const [totalItems, documents] = await Promise.all([
            this.db
                .select({ count: countDistinct(schema.document.id) })
                .from(schema.document)
                .innerJoin(schema.documentAccess, eq(schema.document.id, schema.documentAccess.documentId))
                .where(and(...conditions))
                .execute()
                .then((r) => r.at(0)?.count ?? 0),

            this.db
                .selectDistinctOn([schema.document.id])
                .from(schema.document)
                // .innerJoin(schema.documentAccess, eq(schema.document.id, schema.documentAccess.documentId))
                .where(and(...conditions))
                .limit(limit)
                .offset(offset)
                .execute()
        ])        

        console.debug({ documents })

        const docResult = docMapper.mapMany(documents)

        return docResult.map(documents => PaginationUtils.createPaginatedResult(
            documents,
            totalItems,
            page,
            limit,
        ))
  }
}

// {
//     labels: schema.document.labels,
//     title: schema.document.title,
//     fileType: schema.document.fileType,
//     currentVersion: schema.document.currentVersion,
//     createdBy: schema.document.createdBy,
//     id: schema.document.id,
//     createdAt: schema.document.createdAt,
//     updatedAt: schema.document.updatedAt,
// }