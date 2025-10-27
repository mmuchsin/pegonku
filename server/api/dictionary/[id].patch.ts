import { db } from '../../db'
import { dev_custom_dictionary } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const entryId = Number(id)

  if (!entryId || Number.isNaN(entryId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const body = await readBody(event)
  const { teks_ind, pegon } = body

  if (!teks_ind?.trim() || !pegon?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Fields required' })
  }

  const result = await db
    .update(dev_custom_dictionary)
    .set({
      teks_ind: teks_ind.trim(),
      pegon: pegon.trim(),
      updated_at: new Date()
    })
    .where(eq(dev_custom_dictionary.id, entryId))
    .returning()

  if (!result?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return { success: true, data: result[0] }
})
