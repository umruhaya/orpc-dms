import {
    ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  
} from "@domain/utils/base.errors"

export class DocumentNotFoundError extends NotFoundError {
  override readonly code = "DOCUMENT_NOT_FOUND" as const

  constructor(documentId: string, context?: Record<string, unknown>) {
    super("DocumentList", documentId, context)
  }
}

export class DocumentConflictError extends ConflictError {
  override readonly code = "DOCUMENT_CONFLICT" as const
}

export class DocumentValidationError extends ValidationError {
  override readonly code = "DOCUMENT_VALIDATION_ERROR" as const
}

export class DocumentOwnershipError extends ForbiddenError {
  override readonly code = "DOCUMENT_OWNERSHIP_ERROR" as const
  readonly documentId: string

  constructor(documentId: string, context?: Record<string, unknown>) {
    super("You are not the owner of this document", "document:owner", context)
    this.documentId = documentId
  }
}

export class DocumentEditError extends ForbiddenError {
  override readonly code = "DOCUMENT_EDIT_ERROR" as const
  readonly documentId: string

  constructor(documentId: string, context?: Record<string, unknown>) {
    super("You are not the editor of this document", "document:editor", context)
    this.documentId = documentId
  }
}

export class DocumentViewError extends ForbiddenError {
  override readonly code = "DOCUMENT_VIEW_ERROR" as const
  readonly documentId: string

  constructor(documentId: string, context?: Record<string, unknown>) {
    super("You are not the viewer of this document", "document:editor", context)
    this.documentId = documentId
  }
}
