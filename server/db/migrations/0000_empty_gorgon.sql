CREATE TABLE "custom_dictionary" (
	"id" serial PRIMARY KEY NOT NULL,
	"teks_ind" text NOT NULL,
	"pegon" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_dictionary_teks_ind_unique" UNIQUE("teks_ind")
);
