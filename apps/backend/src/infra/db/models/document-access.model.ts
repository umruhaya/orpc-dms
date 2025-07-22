import { type DocumentAccessType } from "@domain/document-access/document-access.entity"
import { pgEnum, pgTable, primaryKey, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { document } from './document.model'
import { user } from './auth.model'
import { type UserType } from "@domain/user/user.entity"
import { type DocumentType } from "@domain/document/document.entity"
import { relations } from "drizzle-orm"
import type { DateTimeEncoded } from "@domain/utils"


export const rolesPgEnum = pgEnum('document_roles', ['viewer', 'editor', 'owner'])

type UserId = UserType["id"]
type DocumentId = DocumentType["id"]
type DocumentAccessId = DocumentAccessType["id"]

export const documentAccess = pgTable(
	'document_access',
	{
        // Base Columns
        id: uuid("id")
            .$type<DocumentAccessId>()
            .defaultRandom(),
        createdAt: timestamp("created_at")
            .$type<DateTimeEncoded>()
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at")
            .$type<DateTimeEncoded>()
            .notNull()
            .defaultNow(),
        
		userId: uuid('user_id')
            .$type<UserId>()
            .defaultRandom() 
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		documentId: uuid('document_id')
            .$type<DocumentId>()
            .defaultRandom() 
			.notNull()
			.references(() => document.id, { onDelete: 'cascade' }),
		role: rolesPgEnum('role').notNull(),
	},
	(table) => [
        primaryKey({ columns: [table.userId, table.documentId] }),
        unique().on(table.id),
    ],
)

export const documentAccessRelations = relations(
    documentAccess,
    ({ one }) => ({
        user: one(user, {
            fields: [documentAccess.userId],
            references: [user.id],
        }),
        document: one(document, {
            fields: [documentAccess.documentId],
            references: [document.id],
        }),
    })
)
