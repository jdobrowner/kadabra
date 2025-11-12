# Kadabra Demo

A React + TypeScript demo application built with modern tooling.

## Tech Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Reshaped** - Component library
- **Phosphor Icons** - Icon library
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - Type-safe SQL ORM
- **Vercel Postgres** - PostgreSQL database
- **OpenAI** - AI agent functionality

## Getting Started

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the application:**
   - Follow the comprehensive setup guide: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
   - This covers database setup, OAuth configuration, environment variables, and more

3. **Test the application:**
   - See [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md) for testing guides

### Documentation

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Complete setup guide (Vercel, database, OAuth, etc.)
- **[TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md)** - Comprehensive testing guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Consolidated API documentation
- **[API_DOCUMENTATION.yaml](./API_DOCUMENTATION.yaml)** - OpenAPI/Swagger specification (import into Swagger UI, Postman, etc.)
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Detailed database setup reference
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth configuration guide
- **[INGEST_API.md](./INGEST_API.md)** - Communication ingestion API documentation (detailed)
- **[API_RESPONSE_DESIGN.md](./API_RESPONSE_DESIGN.md)** - tRPC endpoint response structures
- **[APPLICATION_REVIEW.md](./APPLICATION_REVIEW.md)** - Application review and recommendations

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Database Commands

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (development)
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Project Structure

```
kadabra-demo/
├── src/
│   ├── store/          # Zustand stores
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

