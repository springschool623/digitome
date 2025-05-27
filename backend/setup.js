import { createDatabase, closePool } from './sql/database.js'
import { createSchema } from './sql/schema.js'
import { runSeeds } from './sql/seed.js'
import { startServer } from './server.js'

async function setup() {
  try {
    console.log('Starting setup...')

    // Create database if not exists
    console.log('Creating database...')
    await createDatabase()

    // Create schema
    console.log('Creating schema...')
    await createSchema()

    // Run seeds
    console.log('Running seeds...')
    await runSeeds()

    // Close the postgres pool
    await closePool()

    console.log('Setup completed successfully!')

    // Start the server
    console.log('Starting server...')
    startServer()
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

setup()
