# FIDP Map

Interactive property map dashboard for the FIDP (Fondation Immobilière de Droit Public) real estate portfolio. This application provides a modern, high-fidelity visualization of properties across Geneva and surrounding areas, featuring clustering, multi-criteria filtering, and internationalization.

## Key Features

- **High-Performance Map**: Integrated with MapLibre GL JS and OpenFreeMap for smooth, high-fidelity vector tiles.
- **Advanced Clustering**: Smart pin clustering system that centers and zooms intelligently based on viewport constraints and sidebar states.
- **Modern Floating UI**: Theme-aware "Modern Floating" experience with glassmorphism design tokens (optimized for visibility).
- **Dynamic Filtering**: Multi-select filtering by Fondation and Localité with real-time results and list synchronization.
- **Internationalization (i18n)**: Full support for French, English, German, and Italian.
- **Satellite View**: High-resolution satellite imagery toggle using ArcGIS tiles with vibrant custom markers.
- **Building Layouts**: Detailed building footprint overlays available at high zoom levels.
- **Property Details**: Rich sidebar view with image carousels, full-screen galleries, and direct Google Maps links.

## Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Database**: [Turso](https://turso.tech/) (libSQL)
- **Map Engine**: [MapLibre GL JS](https://maplibre.org/) with [react-map-gl](https://visgl.github.io/react-map-gl/)
- **Tiles**: OpenFreeMap, OpenStreetMap & ArcGIS (Satellite)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI & Lucide Icons
- **State Management**: React Hooks & LocalStorage persistence
- **Testing**: Vitest & React Testing Library
- **CI/CD**: GitHub Actions

## Prerequisites

- **Node.js**: 24.x or higher
- **npm**: Standard Node package manager
- **Turso CLI**: Required for database management
- **SQLite3**: For local database inspection

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/boran/fidp-map.git
cd fidp-map
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

The application is configured to automatically use a local database file if no environment variables are provided.

Ensure you have the `fidp.db` file in your project root. If you only have a SQL dump:

```bash
sqlite3 fidp.db < dump.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the map.

## Environment Variables (Production)

While local development requires no configuration, production deployment (Vercel) requires the following variables:

| Variable             | Description                              |
| -------------------- | ---------------------------------------- |
| `TURSO_DATABASE_URL` | Your Turso DB URL (e.g., `libsql://...`) |
| `TURSO_AUTH_TOKEN`   | Your Turso Auth Token                    |

## Architecture

### Directory Structure

```
├── app/
│   └── [lang]/              # i18n dynamic routes
├── components/
│   ├── map/                 # Core map engine & sidebar components
│   └── ui/                  # Reusable Shadcn/Radix primitives
├── dictionaries/            # JSON translation files (FR, EN, DE, IT)
├── hooks/                   # Custom hooks (LocalStorage, etc.)
├── lib/                     # Database client & utility functions
└── public/                  # Static assets & logos
```

### Data Model

The application uses a `property` table with the following schema:

- `id`: Unique identifier
- `name`: Property designation
- `address1` / `address2`: Split address lines
- `localite` / `zip`: Geographic identifiers
- `lat` / `lng`: Coordinate pair
- `geometry`: GeoJSON Point string
- `images` / `tags`: JSON arrays

## Available Scripts

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Starts the Next.js development server |
| `npm run build`     | Builds the production application     |
| `npm run test`      | Runs all unit tests with Vitest       |
| `npm run lint`      | Runs ESLint for code quality          |
| `npm run typecheck` | Runs TypeScript compiler checks       |

## CI/CD

The project includes a robust **GitHub Actions** workflow (`.github/workflows/ci.yml`) that triggers on every push and pull request. It performs the following checks:

1. Dependency Installation
2. ESLint Validation
3. TypeScript Type-Checking
4. Unit Testing (Vitest)
5. Dry-Build (Production Simulation)

## Deployment

### Database (Turso)

1. **Create Database**: `turso db create fidp-map`
2. **Push Data**: `sqlite3 fidp.db .dump | turso db shell fidp-map`
3. **Get Credentials**: `turso db show fidp-map --url` and `turso db tokens create fidp-map`

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel.
2. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Environment Variables.
3. The application is optimized for the **Edge Runtime** but defaults to standard serverless deployment.
