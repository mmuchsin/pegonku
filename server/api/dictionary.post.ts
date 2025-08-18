import { db } from './../db'
import { custom_dictionary } from './../db/schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { teks_ind, pegon } = body

    if (!teks_ind || !pegon) {
      throw createError({
        statusCode: 400,
        statusMessage: 'teks_ind and pegon are required'
      })
    }

    const result = await db.insert(custom_dictionary)
      .values({ 
        teks_ind, 
        pegon 
      })
      .onConflictDoUpdate({
        target: custom_dictionary.teks_ind,
        set: { 
          pegon,
          updated_at: new Date()
        }
      })
      .returning()
      
    return result[0]
      
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save dictionary entry'
    })
  }
})