import { pgTable, unique, serial, text, timestamp, integer } from "drizzle-orm/pg-core"


export const customDictionary = pgTable("custom_dictionary", {
	id: serial().primaryKey().notNull(),
	teksInd: text("teks_ind").notNull(),
	pegon: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("custom_dictionary_teks_ind_unique").on(table.teksInd),
]);
