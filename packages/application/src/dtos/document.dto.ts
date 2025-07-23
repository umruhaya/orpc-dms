import { validateWithEffect } from "@application/utils/validation.utils"
import type { Result } from "@carbonteq/fp"
import {
  type DocumentCreateData,
  DocumentCreateSchema,
} from "@domain/document/document.entity"
import type { ValidationError } from "@domain/utils/base.errors"

export class CreateDocumentDto implements DocumentCreateData {
  readonly labels: readonly string[]

  private constructor(data: DocumentCreateData) {
    this.labels = data.labels
  }

  static create(data: unknown): Result<CreateDocumentDto, ValidationError> {
    return validateWithEffect(DocumentCreateSchema, data).map(
      (validatedData) => new CreateDocumentDto(validatedData),
    )
  }
}