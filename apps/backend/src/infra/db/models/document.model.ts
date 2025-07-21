import { type DocumentType } from "@domain/document/document.entity"
import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core"
import { getBaseColumns, getUUIDKeyCol } from "../db.utils"
import type { DateTimeEncoded } from "@domain/utils"

type DocumentId = DocumentType["id"]

export const document = pgTable("documents", {
    ...getBaseColumns<DocumentId>(),
    currentVersion: text("current_version").notNull(),
    labels: text('labels').array().notNull(),

    title: text("title").notNull(),
    fileType: text("file_type").notNull(),
})

export const documentVersion = pgTable("documents_version", {
    id: getUUIDKeyCol<DocumentId>().references(() => document.id),
    version: integer("version").notNull(),
    
    title: text("title").notNull(),
    description: text("description"),
    fileType: text("file_type").notNull(),
    contentUri: text("content_uri").notNull(),

    createdAt: timestamp("created_at")
        .$type<DateTimeEncoded>()
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at")
        .$type<DateTimeEncoded>()
        .notNull()
        .defaultNow(),
}, table => [
    primaryKey({ name: 'id_version_pk', columns: [table.id, table.version] }),
])