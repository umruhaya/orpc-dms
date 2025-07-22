import { ConflictError, NotFoundError, ValidationError } from "@domain/utils/base.errors"

export class DocumentAccessNotFoundError extends NotFoundError {
  override readonly code = "DOCUMENT_ACCESS_NOT_FOUND" as const

  constructor(documentId: string, context?: Record<string, unknown>) {
    super("DocumentAccess", documentId, context)
  }
}

export class DocumentAccessConflictError extends ConflictError {
  override readonly code = "DOCUMENT_ACCESS_CONFLICT" as const
}

export class DocumentAccessValidationError extends ValidationError {
  override readonly code = "DOCUMENT_ACCESS_VALIDATION_ERROR" as const
}