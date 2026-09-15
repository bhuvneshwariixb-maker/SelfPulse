import { getDatabase } from './init.js'

export async function migrate() {
  const db = await getDatabase()
  console.log('Database initialization complete. Schema has been created.')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
