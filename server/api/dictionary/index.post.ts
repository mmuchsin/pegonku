import { db } from '../../db'
import { dev_custom_dictionary } from '../../db/schema'

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

    const result = await db
      .insert(dev_custom_dictionary)
      .values({
        teks_ind: teks_ind.trim(),
        pegon: pegon.trim(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()

    return {
      success: true,
      data: result[0]
    }
  } catch (error: any) {
    console.error('[POST Dictionary] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create dictionary entry'
    })
  }
})
