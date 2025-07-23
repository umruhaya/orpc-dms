import { DocumentWorkflows } from "@application/workflows"
import { container } from "tsyringe"
import { authenticated } from "../utils/orpc"
import { handleAppResult } from "../utils/result-handler"
import { DocumentEntity } from "@domain/document/document.entity"

const base = authenticated.documents

const getDocumentsHandler = base.getDocuments.handler(
  async ({
    input,
    context,
  }) => {
    const documentFlows = container.resolve(DocumentWorkflows)
    const result = await documentFlows.getDocumentsWithFilters(
        context.user,
        input,
    )
    return handleAppResult(result)
  },
)

const createDocumentHandler = base.createDocument.handler(
  async ({
    input,
    context,
  }) => {
    const documentFlows = container.resolve(DocumentWorkflows)
    const result = await documentFlows.createDocument(
      context.user,
      input,
    )

    return handleAppResult(result)
  },
)

export default base.router({
    getDocuments: getDocumentsHandler,
    createDocument: createDocumentHandler, 
})
