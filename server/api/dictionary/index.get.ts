// server/api/dictionary/index.get.ts
import { db } from '../../db'
import { custom_dictionary } from '../../db/schema'
import { like, or, eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search as string | undefined
    const mode = query.mode as 'contain' | 'exact' | undefined // ✨ Add mode parameter

    let queryBuilder = db.select().from(custom_dictionary)

    // Add search filter if provided
    if (search) {
      if (mode === 'exact') {
        // ✨ Exact match
        queryBuilder = queryBuilder.where(
          or(
            eq(custom_dictionary.teks_ind, search),
            eq(custom_dictionary.pegon, search)
          )
        )
      } else {
        // ✨ Contains (default)
        queryBuilder = queryBuilder.where(
          or(
            like(custom_dictionary.teks_ind, `%${search}%`),
            like(custom_dictionary.pegon, `%${search}%`)
          )
        )
      }
    }

    const result = await queryBuilder

    return result
  } catch (error: any) {
    console.error('[GET Dictionary] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dictionary'
    })
  }
})
