import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const custom_dictionary = pgTable('custom_dictionary', {
  id: serial('id').primaryKey(),
  teks_ind: text('teks_ind').notNull().unique(),
  pegon: text('pegon').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export type CustomDictionary = typeof custom_dictionary.$inferSelect
export type NewCustomDictionary = typeof custom_dictionary.$inferInsert