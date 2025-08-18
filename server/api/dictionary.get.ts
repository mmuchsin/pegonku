import { db } from './../db'
import { custom_dictionary } from './../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const result = await db.select().from(custom_dictionary)
    return result
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dictionary entries'
    })
  }
})