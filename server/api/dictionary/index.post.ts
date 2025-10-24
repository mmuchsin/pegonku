import { db } from '../../db'
import { dev_custom_dictionary } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { teks_ind, pegon } = body

    // Validation
    if (!teks_ind?.trim() || !pegon?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Both teks_ind and pegon are required'
      })
    }

    const trimmedTeksInd = teks_ind.trim()
    const trimmedPegon = pegon.trim()

    // Check if word already exists
    const existing = await db
      .select()
      .from(dev_custom_dictionary)
      .where(eq(dev_custom_dictionary.teks_ind, trimmedTeksInd))
      .limit(1)

    if (existing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Word already exists in dictionary'
      })
    }

    const result = await db
      .insert(dev_custom_dictionary)
      .values({
        teks_ind: trimmedTeksInd,
        pegon: trimmedPegon,
        // created_at and updated_at will use defaultNow()
      })
      .returning()

    return {
      success: true,
      data: result[0]
    }
  } catch (error: any) {
    console.error('[POST Dictionary] Error:', {
      message: error.message,
      code: error.code, // PostgreSQL error code
      constraint: error.constraint, // Which constraint failed
    })

    // Handle unique constraint violation
    if (error.code === '23505') { // PostgreSQL unique violation
      throw createError({
        statusCode: 409,
        statusMessage: 'Word already exists in dictionary'
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to create dictionary entry'
    })
  }
})
