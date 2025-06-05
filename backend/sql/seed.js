import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SEEDS_DIR = path.join(__dirname, 'seeds')

// Define the order of seed files based on dependencies
const SEED_ORDER = [
  // Basic data
  'ranks.seed.sql',
  'positions.seed.sql',
  'departments.seed.sql',
  'locations.seed.sql',

  // Roles and permissions
  'roles.seed.sql',
  'permissions.seed.sql',
  'role_permission.seed.sql',

  // User data
  'contacts.seed.sql',
  'accounts.seed.sql',
]

async function runSeeds() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // First, clear all existing data in reverse order
    console.log('Clearing existing data...')
    for (const seedFile of [...SEED_ORDER].reverse()) {
      const tableName = seedFile.split('.')[0]
      try {
        await client.query(`TRUNCATE TABLE ${tableName} CASCADE`)
        console.log(`Cleared data from table ${tableName}`)
      } catch (error) {
        console.error(`Error clearing table ${tableName}:`, error.message)
      }
    }

    // Then run seeds in the specified order
    console.log('Inserting new data...')
    for (const seedFile of SEED_ORDER) {
      const filePath = path.join(SEEDS_DIR, seedFile)
      console.log(`Processing seed file: ${seedFile}`)

      try {
        const sql = fs.readFileSync(filePath, 'utf8')
        await client.query(sql)
        console.log(`Successfully executed seed file: ${seedFile}`)
      } catch (error) {
        console.error(`Error executing seed file ${seedFile}:`, error.message)
        throw error
      }
    }

    await client.query('COMMIT')
    console.log('All seed files executed successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error running seed files:', error)
    throw error
  } finally {
    client.release()
  }
}

// Function to clear all seed data (useful for testing/reset)
async function clearSeeds() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Clear data in reverse order to handle dependencies
    for (const seedFile of [...SEED_ORDER].reverse()) {
      const tableName = seedFile.split('.')[0]
      try {
        await client.query(`TRUNCATE TABLE ${tableName} CASCADE`)
        console.log(`Cleared data from table ${tableName}`)
      } catch (error) {
        console.error(`Error clearing table ${tableName}:`, error.message)
      }
    }

    await client.query('COMMIT')
    console.log('All seed data cleared successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error clearing seed data:', error)
    throw error
  } finally {
    client.release()
  }
}

export { runSeeds, clearSeeds }
