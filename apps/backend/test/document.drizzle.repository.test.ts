import 'reflect-metadata'
import { describe, test, expect, beforeAll, beforeEach, afterAll } from "bun:test"
import { container } from "tsyringe"
import { sql } from "drizzle-orm"

// --- Real Domain/Infra Imports ---
import { DrizzleDocumentRepository } from "@infra/db/repos/document.repository"
import { DocumentEntity, type DocumentUpdateData } from "@domain/document/document.entity"
import { UserEntity, type UserType } from "@domain/user/user.entity"
import { DocumentNotFoundError } from "@domain/document/document.errors"
import type { DocumentFindFilters } from "@domain/document/document.repository"
import { createDbInstance, type AppDatabase } from "@infra/db/conn"
import { schema } from "@infra/db/schema"

// createdb -h 127.0.0.1 -p 5432 -U main testing

const dbUrl = process.env.DB_URL
if (!dbUrl) {
	throw new Error("DB_URL environment variable is not set.")
}
if (dbUrl) {
	const dbName = dbUrl.split("/").pop()
	if(dbName !== 'testing') {
		throw new Error("database should be `testing`")
	}
}

const uuid = () => crypto.randomUUID()

describe("Document Drizzle Repository (Integration)", () => {
    let documentRepo: DrizzleDocumentRepository
    let db: AppDatabase

    // Helper to create an in-memory UserEntity
    const createTestUserObject = (id: string, name: string): UserEntity => {
        return UserEntity.fromEncoded({
            id: id,
            name: name,
            email: `${name.toLowerCase()}@test.com` as UserType['email'],
            emailVerified: true,
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).unwrap()
    }

    // Helper to persist a UserEntity to the database.
    // This is a crucial part of the "Arrange" step for our tests.
    const persistUser = async (user: UserEntity) => {
        // We can't use a userRepo here because that would create a circular dependency
        // and we want to test the documentRepo in isolation from the userRepo logic.
        // We interact directly with the DB, which is fine for test setup.
        await db.insert(schema.user).values({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image.safeUnwrap(), // Handle Option type
            createdAt: new Date(user.createdAt.epochMillis),
            updatedAt: new Date(user.updatedAt.epochMillis)
        });
    }

    beforeAll(async () => {
        db = createDbInstance()

        container.registerInstance(Symbol.for("Database"), db)
        documentRepo = container.resolve(DrizzleDocumentRepository)
    })

    beforeEach(async () => {
        // TRUNCATE all tables that will be touched during the tests.
        // The order matters if you don't use CASCADE. With CASCADE, it's safer.
        await db.execute(sql`TRUNCATE TABLE ${schema.documentAccess}, ${schema.document}, ${schema.user} RESTART IDENTITY CASCADE;`)
    })

    afterAll(async () => {
        // Clean-up logic if needed
    })

    test("should create and find a document by ID", async () => {
        // Arrange
        const owner = createTestUserObject(uuid(), "test-user")
        await persistUser(owner) // Persist the user before creating the document
        const doc = DocumentEntity.create({ labels: ["test", "important"] }, owner)

        // Act
        const createResult = await documentRepo.create(doc)
        
        // Assert
        expect(createResult.isOk()).toBe(true)
        const findResult = await documentRepo.findById(doc.id)
        expect(findResult.isOk()).toBe(true)
        const foundDoc = findResult.unwrap()
        expect(foundDoc.id).toBe(doc.id)
        expect(foundDoc.createdBy).toBe(owner.id)
        expect(foundDoc.labels).toEqual(["test", "important"])
    })

    test("should update a document's labels", async () => {
        // Arrange
        const owner = createTestUserObject(uuid(), "update-user")
        await persistUser(owner)
        const doc = DocumentEntity.create({ labels: ["original"] }, owner)
        await documentRepo.create(doc)
        const updates: DocumentUpdateData = { labels: ["updated", "archived"] }

        // Act
        await documentRepo.update(doc.id, updates)

        // Assert
        const findResult = await documentRepo.findById(doc.id)
        const updatedDoc = findResult.unwrap()
        expect(updatedDoc.labels).toEqual(["updated", "archived"])
        expect(updatedDoc.updatedAt.epochMillis).toBeGreaterThan(doc.createdAt.epochMillis)
    })
    
    // ... other simple tests like findById not found, delete, etc.

    describe("findWithFilters", () => {
        const user1 = createTestUserObject(uuid(), 'Alice');
        const user2 = createTestUserObject(uuid(), 'Bob');
        let doc1: DocumentEntity, doc2: DocumentEntity, doc3: DocumentEntity;

        // This hook now handles all setup for the filtering tests
        beforeEach(async () => {
            // Arrange: Persist all necessary users first
            await persistUser(user1);
            await persistUser(user2);

            // Arrange: Create document entities in memory
            doc1 = DocumentEntity.create({ labels: ['work', 'urgent'] }, user1);
            doc2 = DocumentEntity.create({ labels: ['personal', 'planning'] }, user1);
            doc3 = DocumentEntity.create({ labels: ['work', 'shared'] }, user2);

            // Arrange: Persist the documents
            await Promise.all([
                documentRepo.create(doc1),
                documentRepo.create(doc2),
                documentRepo.create(doc3)
            ]);

            // Arrange: Persist the access rights
            await db.insert(schema.documentAccess).values([
                { documentId: doc1.id, userId: user1.id, role: "owner" },
                { documentId: doc2.id, userId: user1.id, role: "owner" },
                { documentId: doc3.id, userId: user1.id, role: "editor" },
                { documentId: doc3.id, userId: user2.id, role: "owner" },
            ]);
        });
        
        test('should filter by userId', async () => {
            // Act
            const filters: DocumentFindFilters = { userId: user2.id };
            const result = await documentRepo.findWithFilters(filters);

            // Assert
            const paginated = result.unwrap();
            expect(paginated.totalCount).toBe(1);
            expect(paginated.items[0]?.id).toBe(doc3.id);
        });

        test('should filter by tags', async () => {
            // Act
            const filters: DocumentFindFilters = { userId: user1.id, tags: ['work'] };
            const result = await documentRepo.findWithFilters(filters);
            
            // Assert
            const paginated = result.unwrap();
            expect(paginated.totalCount).toBe(2);
            const returnedIds = paginated.items.map(d => d.id).sort();
            expect(returnedIds).toEqual([doc1.id, doc3.id].sort());
        });

        // ... other filter tests
    });
})