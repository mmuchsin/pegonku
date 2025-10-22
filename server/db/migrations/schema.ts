import { pgTable, unique, serial, text, timestamp, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const customDictionary = pgTable("custom_dictionary", {
	id: serial().primaryKey().notNull(),
	teksInd: text("teks_ind").notNull(),
	pegon: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("custom_dictionary_teks_ind_unique").on(table.teksInd),
]);

export const devCustomDictionary = pgTable("dev_custom_dictionary", {
	id: integer().default(sql`nextval('custom_dictionary_id_seq'::regclass)`).primaryKey().notNull(),
	teksInd: text("teks_ind").notNull(),
	pegon: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("custom_dictionary_dev_teks_ind_key").on(table.teksInd),
]);
