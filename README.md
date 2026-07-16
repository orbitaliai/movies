# Aurora Cinemas

A multi-location movie theater demo built with Next.js, Flowbite React, Tailwind CSS, and SQLite.

## Features

- Public location selector with theater information, amenities, movies, and showtimes
- Four seeded locations, twelve nostalgic films from 1990–2001, authentic poster artwork, and four days of mock schedules
- Admin dashboard for location details, movies, and screening schedules
- Persistent SQLite storage with automatic first-run schema creation and seeding
- Standalone Docker image and a single-replica Kubernetes deployment with a persistent volume

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is created at `data/cinema.db` on first run.

The admin area is at [http://localhost:3000/admin](http://localhost:3000/admin):

- Username: `admin`
- Password: `admin`

These credentials are intentionally fixed for this demo and must not be used as a production authentication design.

## Configuration

| Variable        | Default            | Purpose                           |
| --------------- | ------------------ | --------------------------------- |
| `DATABASE_PATH` | `./data/cinema.db` | SQLite database file              |
| `AUTH_SECRET`   | demo fallback      | Salt for the admin session cookie |

## Docker

```bash
docker build -t aurora-cinema:latest .
docker run --rm -p 3000:3000 -v aurora-data:/app/data aurora-cinema:latest
```

## Deployment

Deployments follow the same Orbitali Kubernetes pattern as the sibling Restaurant app. A push to `main` builds a commit-tagged image, publishes it to GHCR, and asks the deployment API to roll it out. The production host defaults to:

```text
movies.orbitali.ai
```

Configure these GitHub settings before the first deployment:

| Type     | Name                         | Purpose                                                  |
| -------- | ---------------------------- | -------------------------------------------------------- |
| Secret   | `DEPLOY_API_URL`             | Orbitali deployment API base URL                         |
| Secret   | `DEPLOY_API_KEY`             | Deployment API authentication                            |
| Variable | `PRODUCTION_NAMESPACE`       | Kubernetes namespace                                     |
| Variable | `PRODUCTION_HOSTS`           | Optional host override; defaults to `movies.orbitali.ai` |
| Variable | `PRODUCTION_ENV_SECRET_NAME` | Optional Kubernetes environment secret name              |
| Variable | `APP_PORT`                   | Optional application port; defaults to `3000`            |

The referenced environment secret should set a non-default `AUTH_SECRET`. SQLite is stored at `/app/data/cinema.db`; the deployment must keep `/app/data` on persistent single-writer storage and run one application replica.

## Demo artwork

The theatrical poster images are loaded at runtime from TMDB and are not redistributed in this repository or container image. Movie titles and artwork remain the property of their respective owners; this project is not endorsed by TMDB or the film studios.
