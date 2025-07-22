import type { DocumentType } from "@domain/document/document.entity"
import type { DateTimeEncoded } from "@domain/utils"
import { pgTable, uuid, primaryKey, text, timestamp, integer  } from "drizzle-orm/pg-core"
import { document } from "./document.model"
import { relations } from "drizzle-orm"

type DocumentId = DocumentType["id"]

export const documentVersion = pgTable(
  "documents_version",
  {
    // Base Columns
    id: uuid("id")
        .notNull()
        .$type<DocumentId>()
        .defaultRandom()
        .references(() => document.id),
    createdAt: timestamp("created_at")
      .$type<DateTimeEncoded>()
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at")
      .$type<DateTimeEncoded>()
      .notNull()
      .defaultNow(),
    
    // 2nd Key of Composite Primary Key
    version: integer("version").notNull(),

    title: text("title").notNull(),
    description: text("description"),
    fileType: text("file_type").notNull(),
    contentUri: text("content_uri").notNull(),

    
  },
  (table) => [
    primaryKey({ name: "id_version_pk", columns: [table.id, table.version] }),
  ],
)

export const documentVersionRelations = relations(
    documentVersion,
    ({ one }) => ({
        document: one(document, {
            fields: [documentVersion.id],
            references: [document.id],
        })
    })
)