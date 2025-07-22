#!/usr/bin/env bun
import "reflect-metadata"
import { schema } from "@infra/db/schema"
import { seed } from "drizzle-seed"
import { createDbInstance } from "@/infra/db/conn"

const db = createDbInstance()

const CLEAR_ALL_EXISTING_DATA = process.env.CLEAR_DATA === "1"

const userIds = Array.from({ length: 20 }, () => crypto.randomUUID())

async function seedDatabase() {
  console.log("🌱 Starting database seed...")

  try {
    // Delete Existing Data
    if(CLEAR_ALL_EXISTING_DATA) {
        console.log("🌱 Clearing Existing Data...")
        // List Tables in Reverse Order of Dependencies/References, to clear the references first
        await Promise.all([
            db.delete(schema.groceryListItems),
            db.delete(schema.groceryLists),           
            
            db.delete(schema.documentVersion),
            db.delete(schema.documentAccess),
            db.delete(schema.document),
            
            db.delete(schema.session),
            db.delete(schema.verification),
            db.delete(schema.account),
            db.delete(schema.user),
        ])
    }

    await seed(db, schema, { version: '2', seed: 0, count: 20 })

  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
if (import.meta.main) {
  await seedDatabase()
  process.exit(0)
}

export { seedDatabase }
