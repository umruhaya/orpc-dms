import { type DocumentType } from "@domain/document/document.entity"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { getBaseColumns } from "../db.utils"
import { relations } from "drizzle-orm"
import { documentVersion } from "./doucment-version.model"
import { documentAccess } from "./document-access.model"
import { user } from "./auth.model"
import type { UserType } from "@domain/user/user.entity"

type DocumentId = DocumentType["id"]
type UserId = UserType["id"]

export const document = pgTable("documents", {
    ...getBaseColumns<DocumentId>(),
    currentVersion: text("current_version").notNull(),
    labels: text('labels').array().notNull(),

    title: text("title").notNull(),
    fileType: text("file_type").notNull(),

    createdBy: uuid('created_by')
        .$type<UserId>()
        .defaultRandom() 
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
})

export const documentRelations = relations(
    document,
    ({ one, many }) => ({
        version: many(documentVersion),
        access: many(documentAccess),
        user: one(user, {
            fields: [document.createdBy],
            references: [user.id],
        })
    })
)