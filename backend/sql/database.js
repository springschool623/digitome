import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

// Create a pool to connect to postgres database (default database)
const postgresPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres', // Connect to default postgres database
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

async function createDatabase() {
  const client = await postgresPool.connect()

  try {
    // Extract database name from DATABASE_URL
    const dbName = process.env.DATABASE_URL.split('/').pop()

    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    )

    if (result.rowCount === 0) {
      // Create database if it doesn't exist
      await client.query(`CREATE DATABASE ${dbName}`)
      console.log(`Database ${dbName} created successfully`)
    } else {
      console.log(`Database ${dbName} already exists`)
    }
  } catch (error) {
    console.error('Error creating database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Function to check if database exists
async function checkDatabaseExists() {
  const client = await postgresPool.connect()

  try {
    const dbName = process.env.DATABASE_URL.split('/').pop()
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    )
    return result.rowCount > 0
  } catch (error) {
    console.error('Error checking database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Function to drop database if exists
async function dropDatabase() {
  const client = await postgresPool.connect()

  try {
    const dbName = process.env.DATABASE_URL.split('/').pop()
    // Check if database exists
    const exists = await checkDatabaseExists()

    if (exists) {
      // Close all connections to the database
      await client.query(
        `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
      `,
        [dbName]
      )

      // Drop the database
      await client.query(`DROP DATABASE ${dbName}`)
      console.log(`Database ${dbName} dropped successfully`)
    } else {
      console.log(`Database ${dbName} does not exist`)
    }
  } catch (error) {
    console.error('Error dropping database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Function to close the pool when needed
async function closePool() {
  await postgresPool.end()
}

export { createDatabase, checkDatabaseExists, dropDatabase, closePool }
