import { appAuthenticatedBase } from "@contract/utils/oc.base"
// Document Schemas
import {
    DocumentCreateSchema,
    DocumentId,
    DocumentSchema,
    DocumentUpdateSchema,
} from "@domain/document/document.entity"
import {
    GetDocumentSchema,
    PaginatedDocumentSchema,
    DocumentsFilterParamsSchema
} from "@domain/document/document.schemas"
// Document Versions Schemas
import {
    DocumentVersionCreateSchema,
    DocumentVersionSchema,
} from "@domain/document-version/document-version.entity"
import {
    GetDocumentVersionsParamsSchema,
    GetDocumentVersionsResultSchema,
} from "@domain/document-version/document-version.schemas"
// Other Imports
import { Schema as S } from "effect"

const documentsBase = appAuthenticatedBase

const DOCUMENT_TAG = "Documents"

const DocumentIdParamSchema = S.Struct({
  params: S.Struct({
    id: DocumentId,
  }),
})

export const createDocument = documentsBase
  .route({
    method: "POST",
    path: "/documents",
    summary: "Create a Document Resource",
    tags: [DOCUMENT_TAG],
    successStatus: 201,
  })
  .input(S.standardSchemaV1(DocumentCreateSchema))
  .output(S.standardSchemaV1(DocumentSchema))

export const getDocuments = documentsBase
  .route({
    method: "GET",
    path: "/documents",
    summary: "Get Documents with pagination and filters",
    tags: [DOCUMENT_TAG],
  })
  .input(S.standardSchemaV1(DocumentsFilterParamsSchema))
  .output(S.standardSchemaV1(PaginatedDocumentSchema))

export const getDocumentById = documentsBase
  .route({
    method: "GET",
    path: "/documents/:id",
    summary: "Get Documents By ID",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
  })
  .input(S.standardSchemaV1(DocumentIdParamSchema))
  .output(S.standardSchemaV1(GetDocumentSchema))
  .errors({
    NOT_FOUND: { status: 404, message: "Document Not Found" },
  })

export const patchDocument = documentsBase
  .route({
    method: "PATCH",
    path: "/documents/:id",
    summary: "Modify a Document Resource",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      DocumentUpdateSchema.pipe(S.extend(DocumentIdParamSchema)),
    ),
  )
  .output(S.standardSchemaV1(DocumentSchema))
  .errors({
    NOT_FOUND: { status: 404, message: "Document Not Found" },
  })

export const deleteDocument = documentsBase
  .route({
    method: "DELETE",
    path: "/documents/:id",
    summary: "Delete a Document Resource",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
    successStatus: 204,
  })
  .input(S.standardSchemaV1(DocumentIdParamSchema))
  .output(S.standardSchemaV1(S.Void))
  .errors({
    NOT_FOUND: { status: 404, message: "Document Not Found" },
  })

export const createDocumentVersion = documentsBase
  .route({
    method: "POST",
    path: "/documents/:id/versions",
    summary: "Create a New Document Version",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
    successStatus: 201,
  })
  .input(S.standardSchemaV1(DocumentIdParamSchema))
  .output(S.standardSchemaV1(DocumentVersionSchema))
  .errors({
    NOT_FOUND: { status: 404, message: "Document Not Found" },
  })

export const getDocumentVersionById = documentsBase
  .route({
    method: "POST",
    path: "/documents/:id/versions/:version",
    summary: "Get a Document Version By Document Id and Version",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      S.Struct({
        params: S.Struct({
          id: DocumentId,
          version: S.NonNegativeInt,
        }),
      }),
    ),
  )
  .output(S.standardSchemaV1(DocumentVersionSchema))
  .errors({
    NOT_FOUND: { status: 404, message: "Document or Version Not Found" },
  })

export const getLatestDocumentVersion = documentsBase
  .route({
    method: "POST",
    path: "/documents/:id/versions/latest",
    summary: "Get a Document Version By Document Id and Its Latest Version",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      DocumentIdParamSchema.pipe(S.extend(DocumentVersionCreateSchema)),
    ),
  )
  .output(S.standardSchemaV1(DocumentVersionSchema))
  .errors({
    NOT_FOUND: { status: 404, message: "Document or Version Not Found" },
  })

export const listDocumentVersions = documentsBase
  .route({
    method: "GET",
    path: "/documents/:id/versions",
    summary: "List all Document Version with pagination and filters",
    tags: [DOCUMENT_TAG],
    inputStructure: "detailed",
  })
  .input(
    S.standardSchemaV1(
      DocumentIdParamSchema.pipe(S.extend(GetDocumentVersionsParamsSchema)),
    ),
  )
  .output(S.standardSchemaV1(GetDocumentVersionsResultSchema))
  .errors({
    NOT_FOUND: { status: 404, message: "Document Not Found" },
  })

export default {
  createDocument,
  getDocuments,
  getDocumentById,
  patchDocument,
  deleteDocument,
  createDocumentVersion,
  getDocumentVersionById,
  getLatestDocumentVersion,
  listDocumentVersions,
}
