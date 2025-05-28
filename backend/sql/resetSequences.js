import { pool } from '../db.js'
import fs from 'fs/promises'

async function resetSequences() {
  const sql = await fs.readFile('./sql/sequence.sql', 'utf8')
  await pool.query(sql)
  console.log('✅ Sequences reset!')
}

export default resetSequences
