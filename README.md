# Pegonku

Pegonku is a web-based application for transliterating Indonesian (Latin script) text into Pegon (Arabic script). It's built with Nuxt.js, TypeScript, and Tailwind CSS, featuring a powerful conversion engine and a customizable user dictionary backed by a PostgreSQL database via Drizzle ORM.

## Features

-   **Button-driven Transliteration**: Convert Indonesian text to Pegon script with a simple button click.
-   **Custom Dictionary**: Add, view, and manage your own word translations to improve accuracy.
-   **Upsert Functionality**: Easily add new words or update existing ones in the dictionary.
-   **REST API**: Simple API endpoints for managing dictionary entries.
-   **Modern Tech Stack**: Built with Nuxt 3, Drizzle ORM, and PostgreSQL.

## Project Setup

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [pnpm](https://pnpm.io/installation)
-   A running [PostgreSQL](https://www.postgresql.org/) database instance.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pegonku.git
cd pegonku
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and update the database credentials to match your local PostgreSQL setup.

### 4. Apply Database Schema

Push the Drizzle schema to your database. This will create the `custom_dictionary` table.

```bash
pnpm db:push
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

The application should now be running and connected to your database.

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview the production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.