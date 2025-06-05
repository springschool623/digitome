import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db.js'
import { createDatabase } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SCHEMAS_DIR = path.join(__dirname, 'schemas')

// Define the order of table creation based on dependencies
const TABLE_ORDER = [
  'enums.sql',
  'departments.sql',
  'locations.sql',
  'ranks.sql',
  'positions.sql',
  'roles.sql',
  'permissions.sql',
  'role_permission.sql',
  'contacts.sql',
  'accounts.sql',
  'logs.sql',
  'archived_contacts.sql',
  'indexes.sql',
]

async function createSchema() {
  // First, ensure database exists
  await createDatabase()

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Create tables in the specified order
    for (const sqlFile of TABLE_ORDER) {
      const filePath = path.join(SCHEMAS_DIR, sqlFile)
      console.log(`Reading schema file: ${filePath}`) // Debug log

      try {
        const sql = fs.readFileSync(filePath, 'utf8')
        await client.query(sql)
        console.log(`Successfully executed ${sqlFile}`)
      } catch (error) {
        console.error(`Error executing ${sqlFile}:`, error.message)
        throw error
      }
    }

    await client.query('COMMIT')
    console.log('Database schema created successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating database schema:', error)
    throw error
  } finally {
    client.release()
  }
}

// Function to drop all tables (useful for testing/reset)
async function dropSchema() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Drop tables in reverse order to handle dependencies
    for (const sqlFile of [...TABLE_ORDER].reverse()) {
      const tableName = sqlFile.replace('.sql', '')
      try {
        await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`)
        console.log(`Dropped table ${tableName}`)
      } catch (error) {
        console.error(`Error dropping table ${tableName}:`, error.message)
      }
    }

    await client.query('COMMIT')
    console.log('Database schema dropped successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error dropping database schema:', error)
    throw error
  } finally {
    client.release()
  }
}

export { createSchema, dropSchema }
