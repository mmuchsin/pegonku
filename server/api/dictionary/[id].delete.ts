import { db } from '../../db'
import { dev_custom_dictionary } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const entryId = Number(id)

  if (!entryId || Number.isNaN(entryId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const result = await db
    .delete(dev_custom_dictionary)
    .where(eq(dev_custom_dictionary.id, entryId))
    .returning()

  if (!result?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  return { success: true, deleted: result[0] }
})
