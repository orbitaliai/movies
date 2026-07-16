"use client";

import type { Location } from "@/lib/db";
import { Badge, Button, Select } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const dayKey = (iso: string) => iso.slice(0, 10);
const todayKey = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

function dayLabel(key: string) {
  if (key === todayKey()) return "Today";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}T12:00:00Z`));
}

export function CinemaHome({ locations }: { locations: Location[] }) {
  const [locationId, setLocationId] = useState(locations[0]?.id ?? 0);
  const location =
    locations.find((item) => item.id === locationId) ?? locations[0];
  const dates = useMemo(
    () =>
      [
        ...new Set(
          location?.movies.flatMap((movie) =>
            movie.showtimes.map((showtime) => dayKey(showtime.startsAt)),
          ) ?? [],
        ),
      ].sort(),
    [location],
  );
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const activeDate = dates.includes(selectedDate) ? selectedDate : dates[0];

  if (!location) {
    return (
      <main className="grid min-h-screen place-items-center">
        No cinemas are configured.
      </main>
    );
  }

  const movies = location.movies.filter((movie) =>
    movie.showtimes.some(
      (showtime) => dayKey(showtime.startsAt) === activeDate,
    ),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-3 font-black tracking-tight"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-violet-500 text-xl shadow-lg shadow-violet-500/25">
              A
            </span>
            <span className="text-xl">Aurora Cinemas</span>
          </a>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-violet-700"
              href="/admin"
            >
              Team login
            </Link>
          </div>
        </nav>
      </header>

      <section
        id="top"
        className="relative isolate overflow-hidden border-b border-violet-100"
      >
        <div className="aurora-glow absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div>
            <p className="mb-4 text-sm font-bold tracking-[0.22em] text-violet-700 uppercase">
              Four neighborhoods · One great night out
            </p>
            <h1 className="max-w-3xl text-5xl leading-[1.02] font-black tracking-tight sm:text-6xl lg:text-7xl">
              Stories look better on the big screen.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Choose your Aurora cinema and find today&apos;s films, screening
              times, and everything you need for your visit.
            </p>
          </div>
          <div className="self-end rounded-3xl border border-white/80 bg-white/75 p-6 shadow-2xl shadow-violet-200/50 backdrop-blur-xl">
            <label
              htmlFor="location"
              className="mb-3 block text-sm font-semibold text-violet-700"
            >
              Your cinema
            </label>
            <Select
              id="location"
              value={location.id}
              onChange={(event) => {
                setLocationId(Number(event.target.value));
                setSelectedDate(todayKey());
              }}
              sizing="lg"
            >
              {locations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.city}
                </option>
              ))}
            </Select>
            <div className="mt-5 flex flex-wrap gap-2">
              {locations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setLocationId(item.id);
                    setSelectedDate(todayKey());
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${item.id === location.id ? "border-violet-500 bg-violet-600 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
                >
                  {item.name.replace("Aurora ", "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {location.name}
              </h2>
              <Badge color="purple">{location.city}</Badge>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              {location.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {location.amenities.split(",").map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          </div>
          <address className="not-italic md:text-right">
            <p className="font-semibold">{location.address}</p>
            <p className="text-slate-500">{location.city}</p>
            <a
              href={`tel:${location.phone}`}
              className="mt-3 inline-block font-semibold text-violet-700 hover:text-violet-600"
            >
              {location.phone}
            </a>
          </address>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-violet-400 uppercase">
              Now showing
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Pick your next story
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((date) => (
              <Button
                key={date}
                color={date === activeDate ? "purple" : "light"}
                pill
                onClick={() => setSelectedDate(date)}
              >
                {dayLabel(date)}
              </Button>
            ))}
          </div>
        </div>

        {movies.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {movies.map((movie) => (
              <article
                key={movie.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100"
              >
                <div className="relative h-96 overflow-hidden bg-slate-900">
                  <Image
                    src={movie.posterUrl}
                    alt={`${movie.title} theatrical poster`}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3 text-white">
                    <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur">
                      {movie.genre}
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900">
                      {movie.releaseYear}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-2xl leading-tight font-black tracking-tight">
                    {movie.title}
                  </h3>
                  <div className="mb-3 flex gap-3 text-xs font-semibold text-slate-500">
                    <span>{movie.rating}</span>
                    <span>·</span>
                    <span>{movie.runtimeMinutes} min</span>
                  </div>
                  <p className="min-h-20 text-sm leading-6 text-slate-600">
                    {movie.synopsis}
                  </p>
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">
                      Showtimes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {movie.showtimes
                        .filter(
                          (showtime) =>
                            dayKey(showtime.startsAt) === activeDate,
                        )
                        .map((showtime) => (
                          <button
                            key={showtime.id}
                            title={`${showtime.auditorium} · $${showtime.price.toFixed(2)}`}
                            className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 hover:border-violet-600 hover:bg-violet-600 hover:text-white"
                          >
                            {new Intl.DateTimeFormat("en", {
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(showtime.startsAt))}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No screenings are scheduled for this day.
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
        Aurora Cinemas · Demo booking experience ·{" "}
        <Link href="/admin" className="hover:text-violet-700">
          Admin
        </Link>{" "}
        · Poster imagery via{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-violet-700"
        >
          TMDB
        </a>
      </footer>
    </main>
  );
}
