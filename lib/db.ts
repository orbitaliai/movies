import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export type Showtime = {
  id: number;
  startsAt: string;
  auditorium: string;
  price: number;
};

export type Movie = {
  id: number;
  title: string;
  synopsis: string;
  rating: string;
  runtimeMinutes: number;
  genre: string;
  releaseYear: number;
  posterUrl: string;
  posterTheme: string;
  showtimes: Showtime[];
};

export type Location = {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  amenities: string;
  movies: Movie[];
};

const databasePath =
  process.env.DATABASE_PATH ?? join(process.cwd(), "data", "cinema.db");

mkdirSync(dirname(databasePath), { recursive: true });

const globalForDb = globalThis as unknown as { cinemaDb?: Database.Database };

export const db = globalForDb.cinemaDb ?? new Database(databasePath);

if (process.env.NODE_ENV !== "production") globalForDb.cinemaDb = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,
    amenities TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    rating TEXT NOT NULL,
    runtime_minutes INTEGER NOT NULL,
    genre TEXT NOT NULL,
    poster_theme TEXT NOT NULL DEFAULT 'from-violet-700 to-fuchsia-950'
  );

  CREATE TABLE IF NOT EXISTS showtimes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    starts_at TEXT NOT NULL,
    auditorium TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 12.50
  );

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const movieColumns = db.pragma("table_info(movies)") as Array<{ name: string }>;
if (!movieColumns.some((column) => column.name === "release_year")) {
  db.exec(
    "ALTER TABLE movies ADD COLUMN release_year INTEGER NOT NULL DEFAULT 0",
  );
}
if (!movieColumns.some((column) => column.name === "poster_url")) {
  db.exec("ALTER TABLE movies ADD COLUMN poster_url TEXT NOT NULL DEFAULT ''");
}

const NOSTALGIA_CATALOG_VERSION = "nostalgia-2026-04";

const nostalgiaMovies = [
  [
    "Home Alone",
    "Eight-year-old Kevin McCallister turns his house into a fortress when two burglars target it during Christmas vacation.",
    "PG",
    103,
    "Family comedy",
    1990,
    "https://image.tmdb.org/t/p/w500/onTSipZ8R3bliBdKfPtsDuHTdlL.jpg",
    "from-blue-700 to-red-700",
  ],
  [
    "Terminator 2: Judgment Day",
    "A reprogrammed cyborg is sent back in time to protect John Connor from an advanced shape-shifting assassin.",
    "R",
    137,
    "Action sci-fi",
    1991,
    "https://image.tmdb.org/t/p/w500/5M0j0B18abtBI5gi2RhfjjurTqb.jpg",
    "from-sky-900 to-black",
  ],
  [
    "Jurassic Park",
    "A paleontologist visiting a groundbreaking dinosaur theme park must protect two children when the cloned creatures break free.",
    "PG-13",
    127,
    "Adventure",
    1993,
    "https://image.tmdb.org/t/p/w500/63viWuPfYQjRYLSZSZNq7dglJP5.jpg",
    "from-red-700 to-black",
  ],
  [
    "The Lion King",
    "A young lion prince flees his kingdom after tragedy, then learns to embrace his identity and reclaim his home.",
    "G",
    88,
    "Animation",
    1994,
    "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
    "from-orange-500 to-red-900",
  ],
  [
    "Pulp Fiction",
    "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    "R",
    154,
    "Crime",
    1994,
    "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    "from-red-600 to-amber-500",
  ],
  [
    "Toy Story",
    "A cowboy doll feels threatened when a flashy new space ranger becomes the favorite toy in a boy's room.",
    "G",
    81,
    "Animation",
    1995,
    "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
    "from-sky-500 to-blue-800",
  ],
  [
    "Titanic",
    "A young aristocrat falls in love with a free-spirited artist aboard the ill-fated maiden voyage of the Titanic.",
    "PG-13",
    194,
    "Epic romance",
    1997,
    "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    "from-sky-200 to-slate-900",
  ],
  [
    "The Matrix",
    "A computer hacker discovers that the world he knows is a simulation and joins a rebellion against its machine controllers.",
    "R",
    136,
    "Sci-fi",
    1999,
    "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "from-emerald-700 to-black",
  ],
  [
    "The Sixth Sense",
    "A troubled child who sees the dead seeks help from a psychologist carrying a secret of his own.",
    "PG-13",
    107,
    "Supernatural thriller",
    1999,
    "https://image.tmdb.org/t/p/w500/fIssD3w3SvIhPPmVo4WMgZDVLID.jpg",
    "from-amber-600 to-black",
  ],
  [
    "Gladiator",
    "A betrayed Roman general is forced into slavery and fights his way through the arena to avenge his family and emperor.",
    "R",
    155,
    "Epic drama",
    2000,
    "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    "from-amber-700 to-stone-950",
  ],
  [
    "Spirited Away",
    "A young girl enters a world ruled by gods, witches and spirits where humans are transformed into beasts.",
    "PG",
    125,
    "Animated fantasy",
    2001,
    "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "from-rose-500 to-slate-950",
  ],
  [
    "The Lord of the Rings: The Fellowship of the Ring",
    "A young hobbit begins a perilous journey to destroy an ancient ring before its power returns to the Dark Lord.",
    "PG-13",
    178,
    "Fantasy",
    2001,
    "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    "from-amber-600 to-emerald-950",
  ],
] as const;

function insertNostalgiaCatalog(locationIds: number[]) {
  const insertMovie = db.prepare(`
    INSERT INTO movies (title, synopsis, rating, runtime_minutes, genre, release_year, poster_url, poster_theme)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const movieIds = nostalgiaMovies.map((movie) =>
    Number(insertMovie.run(...movie).lastInsertRowid),
  );

  const insertShowtime = db.prepare(`
    INSERT INTO showtimes (location_id, movie_id, starts_at, auditorium, price)
    VALUES (?, ?, ?, ?, ?)
  `);
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let day = 0; day < 4; day += 1) {
    for (let location = 0; location < locationIds.length; location += 1) {
      const locationCatalog = Array.from(
        { length: 6 },
        (_, index) => movieIds[(location * 3 + index) % movieIds.length],
      );
      const availableMovies = Array.from(
        { length: 4 },
        (_, index) => locationCatalog[(day + index) % locationCatalog.length],
      );
      availableMovies.forEach((movieId, index) => {
        [13 + index, 17 + index, 20 + (index % 2)].forEach((hour, slot) => {
          const startsAt = new Date(base);
          startsAt.setDate(base.getDate() + day);
          startsAt.setHours(hour, slot === 1 ? 30 : 0);
          insertShowtime.run(
            locationIds[location],
            movieId,
            startsAt.toISOString(),
            index === 0 ? "Screen 1 · Dolby" : `Screen ${index + 2}`,
            index === 0 ? 15.5 : 12.5,
          );
        });
      });
    }
  }
}

function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM locations").get() as {
    count: number;
  };
  if (count.count > 0) return;

  const seed = db.transaction(() => {
    const insertLocation = db.prepare(`
      INSERT INTO locations (name, slug, address, city, phone, description, amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const locations = [
      [
        "Aurora Downtown",
        "aurora-downtown",
        "18 Market Street",
        "Riverside",
        "+1 (555) 010-1001",
        "Our flagship cinema in the heart of downtown, with a lively lobby bar and the biggest screens in the city.",
        "IMAX, Dolby Atmos, Lounge bar, Accessible",
      ],
      [
        "Aurora Harbor",
        "aurora-harbor",
        "204 Marina Walk",
        "Bayview",
        "+1 (555) 010-2002",
        "A relaxed waterfront theater pairing new releases with sunset views and locally sourced snacks.",
        "Recliners, Harbor parking, Café, Accessible",
      ],
      [
        "Aurora Northgate",
        "aurora-northgate",
        "77 Northgate Avenue",
        "Oak Hills",
        "+1 (555) 010-3003",
        "A family-friendly neighborhood cinema with spacious auditoriums and easy parking.",
        "Family lounge, Free parking, Arcade, Accessible",
      ],
      [
        "Aurora Arts District",
        "aurora-arts",
        "9 Gallery Lane",
        "Riverside",
        "+1 (555) 010-4004",
        "An intimate cinema for bold new releases, independent gems, and filmmaker events.",
        "35mm projection, Wine bar, Q&As, Accessible",
      ],
    ];
    const locationIds = locations.map((location) =>
      Number(insertLocation.run(...location).lastInsertRowid),
    );
    insertNostalgiaCatalog(locationIds);
    db.prepare("INSERT INTO app_meta (key, value) VALUES ('catalog', ?)").run(
      NOSTALGIA_CATALOG_VERSION,
    );
  });
  seed();
}

seedDatabase();

function migrateNostalgiaCatalog() {
  const current = db
    .prepare("SELECT value FROM app_meta WHERE key = 'catalog'")
    .get() as { value: string } | undefined;
  if (current?.value === NOSTALGIA_CATALOG_VERSION) return;

  db.transaction(() => {
    db.prepare("DELETE FROM showtimes").run();
    db.prepare("DELETE FROM movies").run();
    const locationIds = (
      db.prepare("SELECT id FROM locations ORDER BY id").all() as Array<{
        id: number;
      }>
    ).map((location) => location.id);
    insertNostalgiaCatalog(locationIds);
    db.prepare(
      "INSERT INTO app_meta (key, value) VALUES ('catalog', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    ).run(NOSTALGIA_CATALOG_VERSION);
  })();
}

migrateNostalgiaCatalog();

export function getLocations(): Location[] {
  const locations = db
    .prepare("SELECT * FROM locations ORDER BY name")
    .all() as Array<Record<string, string | number>>;

  return locations.map((location) => {
    const rows = db
      .prepare(
        `
        SELECT m.*, s.id AS showtime_id, s.starts_at, s.auditorium, s.price
        FROM showtimes s
        JOIN movies m ON m.id = s.movie_id
        WHERE s.location_id = ? AND s.starts_at >= ?
        ORDER BY s.starts_at
      `,
      )
      .all(
        location.id,
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      ) as Array<Record<string, string | number>>;

    const movies = new Map<number, Movie>();
    for (const row of rows) {
      const movieId = Number(row.id);
      if (!movies.has(movieId)) {
        movies.set(movieId, {
          id: movieId,
          title: String(row.title),
          synopsis: String(row.synopsis),
          rating: String(row.rating),
          runtimeMinutes: Number(row.runtime_minutes),
          genre: String(row.genre),
          releaseYear: Number(row.release_year),
          posterUrl: String(row.poster_url),
          posterTheme: String(row.poster_theme),
          showtimes: [],
        });
      }
      movies.get(movieId)?.showtimes.push({
        id: Number(row.showtime_id),
        startsAt: String(row.starts_at),
        auditorium: String(row.auditorium),
        price: Number(row.price),
      });
    }

    return {
      id: Number(location.id),
      name: String(location.name),
      slug: String(location.slug),
      address: String(location.address),
      city: String(location.city),
      phone: String(location.phone),
      description: String(location.description),
      amenities: String(location.amenities),
      movies: [...movies.values()],
    };
  });
}

export function getAdminData(scheduleLocationId?: number) {
  const movies = db
    .prepare("SELECT * FROM movies ORDER BY title")
    .all() as Array<Record<string, string | number>>;
  const showtimeQuery = db.prepare(`
    SELECT s.*, l.name AS location_name, m.title AS movie_title
    FROM showtimes s
    JOIN locations l ON l.id = s.location_id
    JOIN movies m ON m.id = s.movie_id
    ${scheduleLocationId ? "WHERE s.location_id = ?" : ""}
    ORDER BY s.starts_at DESC
    LIMIT 100
  `);
  const showtimes = (
    scheduleLocationId
      ? showtimeQuery.all(scheduleLocationId)
      : showtimeQuery.all()
  ) as Array<Record<string, string | number>>;

  return {
    locations: db
      .prepare("SELECT * FROM locations ORDER BY name")
      .all() as Array<Record<string, string | number>>,
    movies,
    showtimes,
  };
}
