import { requireAdmin } from "@/lib/auth";
import { getAdminData } from "@/lib/db";
import Link from "next/link";
import {
  addLocation,
  addMovie,
  addShowtime,
  deleteLocation,
  deleteMovie,
  deleteShowtime,
  logout,
  updateLocation,
} from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
const labelClass =
  "block text-xs font-bold tracking-wide text-slate-500 uppercase";
const deleteClass =
  "rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  await requireAdmin();
  const { location } = await searchParams;
  const requestedLocationId = Number(location);
  const scheduleLocationId =
    Number.isInteger(requestedLocationId) && requestedLocationId > 0
      ? requestedLocationId
      : undefined;
  const { locations, movies, showtimes } = getAdminData(scheduleLocationId);
  const selectedLocation = locations.find(
    (cinema) => Number(cinema.id) === scheduleLocationId,
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div>
            <p className="font-black">Aurora Cinemas</p>
            <p className="text-xs text-slate-500">Operations dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-violet-700 hover:text-violet-600"
            >
              View website
            </Link>
            <form action={logout}>
              <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-12 px-5 py-10 lg:px-8">
        <div>
          <p className="text-sm font-bold tracking-widest text-violet-400 uppercase">
            Admin
          </p>
          <h1 className="mt-1 text-4xl font-black">Manage your cinemas</h1>
          <p className="mt-2 text-slate-500">
            Changes are written directly to SQLite and appear on the public site
            immediately.
          </p>
        </div>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Locations</h2>
              <p className="text-sm text-slate-500">
                Contact details, descriptions, and amenities.
              </p>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              {locations.length} locations
            </span>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {locations.map((location) => (
              <form
                action={updateLocation}
                key={location.id}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={location.id} />
                <label className={labelClass}>
                  Name
                  <input
                    name="name"
                    defaultValue={location.name}
                    required
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className={labelClass}>
                  City
                  <input
                    name="city"
                    defaultValue={location.city}
                    required
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className={labelClass}>
                  Address
                  <input
                    name="address"
                    defaultValue={location.address}
                    required
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className={labelClass}>
                  Phone
                  <input
                    name="phone"
                    defaultValue={location.phone}
                    required
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Description
                  <textarea
                    name="description"
                    defaultValue={location.description}
                    required
                    rows={3}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Amenities
                  <input
                    name="amenities"
                    defaultValue={location.amenities}
                    className={`mt-1 ${inputClass}`}
                  />
                </label>
                <div className="flex justify-between sm:col-span-2">
                  <button formAction={deleteLocation} className={deleteClass}>
                    Delete
                  </button>
                  <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500">
                    Save changes
                  </button>
                </div>
              </form>
            ))}
          </div>
          <details className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
            <summary className="cursor-pointer font-bold text-violet-700">
              Add another location
            </summary>
            <form
              action={addLocation}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              {["name", "slug", "city", "address", "phone", "amenities"].map(
                (field) => (
                  <label key={field} className={labelClass}>
                    {field}
                    <input
                      required={field !== "amenities"}
                      name={field}
                      className={`mt-1 ${inputClass}`}
                    />
                  </label>
                ),
              )}
              <label className={`${labelClass} sm:col-span-2`}>
                Description
                <textarea
                  required
                  name="description"
                  rows={3}
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white sm:col-span-2">
                Add location
              </button>
            </form>
          </details>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Movies</h2>
          <p className="mb-5 text-sm text-slate-500">
            The complete catalog used when creating screening schedules.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-bold">{movie.title}</p>
                  <p className="text-xs text-slate-500">
                    {movie.release_year} · {movie.genre} · {movie.rating} ·{" "}
                    {movie.runtime_minutes} min
                  </p>
                </div>
                <form action={deleteMovie}>
                  <input type="hidden" name="id" value={movie.id} />
                  <button className={deleteClass}>Remove</button>
                </form>
              </div>
            ))}
          </div>
          <details className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
            <summary className="cursor-pointer font-bold text-violet-700">
              Add a movie
            </summary>
            <form
              action={addMovie}
              className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <label className={labelClass}>
                Title
                <input required name="title" className={`mt-1 ${inputClass}`} />
              </label>
              <label className={labelClass}>
                Genre
                <input required name="genre" className={`mt-1 ${inputClass}`} />
              </label>
              <label className={labelClass}>
                Rating
                <input
                  required
                  name="rating"
                  placeholder="PG-13"
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className={labelClass}>
                Runtime (minutes)
                <input
                  required
                  min="1"
                  name="runtime"
                  type="number"
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className={labelClass}>
                Release year
                <input
                  required
                  min="1900"
                  max="2100"
                  name="releaseYear"
                  type="number"
                  placeholder="1993"
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                TMDB poster URL
                <input
                  name="posterUrl"
                  placeholder="https://image.tmdb.org/t/p/w500/...jpg"
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>
                Synopsis
                <textarea
                  required
                  name="synopsis"
                  rows={3}
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white sm:col-span-2 lg:col-span-3">
                Add movie
              </button>
            </form>
          </details>
        </section>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold">Schedules</h2>
              <p className="text-sm text-slate-500">
                {selectedLocation
                  ? `Screenings scheduled at ${selectedLocation.name}.`
                  : "Add a screening or remove an existing time."}
              </p>
            </div>
            <form
              method="get"
              action="/admin"
              className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <label className={labelClass}>
                Filter by location
                <select
                  name="location"
                  defaultValue={scheduleLocationId ?? ""}
                  className={`mt-1 min-w-52 ${inputClass}`}
                >
                  <option value="">All locations</option>
                  {locations.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500">
                Filter
              </button>
            </form>
          </div>
          <form
            action={addShowtime}
            className="mb-5 grid gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 md:grid-cols-2 xl:grid-cols-6"
          >
            <label className={labelClass}>
              Location
              <select
                required
                name="locationId"
                className={`mt-1 ${inputClass}`}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Movie
              <select required name="movieId" className={`mt-1 ${inputClass}`}>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Starts at
              <input
                required
                name="startsAt"
                type="datetime-local"
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className={labelClass}>
              Auditorium
              <input
                required
                name="auditorium"
                placeholder="Screen 2"
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className={labelClass}>
              Price ($)
              <input
                required
                name="price"
                type="number"
                min="0"
                step="0.5"
                defaultValue="12.50"
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <button className="self-end rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white">
              Add showtime
            </button>
          </form>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[34rem] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Date & time</th>
                    <th className="p-3">Movie</th>
                    <th className="hidden p-3 md:table-cell">Location</th>
                    <th className="hidden p-3 lg:table-cell">Screen</th>
                    <th className="p-3">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {showtimes.map((showtime) => (
                    <tr key={showtime.id}>
                      <td className="p-3 whitespace-nowrap">
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(String(showtime.starts_at)))}
                      </td>
                      <td className="p-3 font-semibold">
                        {showtime.movie_title}
                      </td>
                      <td className="hidden p-3 text-slate-500 md:table-cell">
                        {showtime.location_name}
                      </td>
                      <td className="hidden p-3 text-slate-500 lg:table-cell">
                        {showtime.auditorium}
                      </td>
                      <td className="p-3 text-right">
                        <form action={deleteShowtime}>
                          <input type="hidden" name="id" value={showtime.id} />
                          <button className="text-xs font-bold text-red-600 hover:text-red-500">
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
