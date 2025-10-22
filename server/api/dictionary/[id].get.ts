import { db } from '../../db'
import { dev_custom_dictionary } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const entryId = Number(id)

    if (!entryId || Number.isNaN(entryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid ID'
      })
    }

    const result = await db
      .select()
      .from(dev_custom_dictionary)
      .where(eq(dev_custom_dictionary.id, entryId))
      .limit(1)

    if (!result?.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Entry not found'
      })
    }

    return result[0]
  } catch (error: any) {
    console.error('[GET Dictionary Entry] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch entry'
    })
  }
})
