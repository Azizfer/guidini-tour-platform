import { MongoClient, Db } from 'mongodb'

let cachedDb: Db | null = null

async function connectToDatabase(): Promise<Db> {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  if (cachedDb) {
    return cachedDb
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()
    cachedDb = db
    return db
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}

export const db = connectToDatabase()
