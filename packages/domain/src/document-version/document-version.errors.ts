import {
  NotFoundError,
  ValidationError,
} from "@domain/utils/base.errors"

export class DocumentVersionNotFoundError extends NotFoundError {
  override readonly code = "DOCUMENT_VERSION_NOT_FOUND" as const

  constructor(documentId: string, context?: Record<string, unknown>) {
    super("DocumentList", documentId, context)
  }
}

export class DocumentVersionValidationError extends ValidationError {
  override readonly code = "DOCUMENT_VERSION_VALIDATION_ERROR" as const
}