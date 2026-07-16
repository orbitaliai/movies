"use server";

import { clearAdminSession, requireAdmin, setAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const number = (form: FormData, key: string) => Number(form.get(key));

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function login(form: FormData) {
  if (
    text(form, "username") !== "admin" ||
    text(form, "password") !== "admin"
  ) {
    redirect("/admin/login?error=1");
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function addLocation(form: FormData) {
  await requireAdmin();
  db.prepare(
    `
    INSERT INTO locations (name, slug, address, city, phone, description, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    text(form, "name"),
    text(form, "slug"),
    text(form, "address"),
    text(form, "city"),
    text(form, "phone"),
    text(form, "description"),
    text(form, "amenities"),
  );
  refresh();
}

export async function updateLocation(form: FormData) {
  await requireAdmin();
  db.prepare(
    `
    UPDATE locations SET name = ?, address = ?, city = ?, phone = ?, description = ?, amenities = ? WHERE id = ?
  `,
  ).run(
    text(form, "name"),
    text(form, "address"),
    text(form, "city"),
    text(form, "phone"),
    text(form, "description"),
    text(form, "amenities"),
    number(form, "id"),
  );
  refresh();
}

export async function deleteLocation(form: FormData) {
  await requireAdmin();
  db.prepare("DELETE FROM locations WHERE id = ?").run(number(form, "id"));
  refresh();
}

export async function addMovie(form: FormData) {
  await requireAdmin();
  db.prepare(
    `
    INSERT INTO movies (title, synopsis, rating, runtime_minutes, genre, release_year, poster_url, poster_theme)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    text(form, "title"),
    text(form, "synopsis"),
    text(form, "rating"),
    number(form, "runtime"),
    text(form, "genre"),
    number(form, "releaseYear"),
    text(form, "posterUrl") ||
      "https://image.tmdb.org/t/p/w500/63viWuPfYQjRYLSZSZNq7dglJP5.jpg",
    text(form, "posterTheme") || "from-violet-600 to-slate-950",
  );
  refresh();
}

export async function deleteMovie(form: FormData) {
  await requireAdmin();
  db.prepare("DELETE FROM movies WHERE id = ?").run(number(form, "id"));
  refresh();
}

export async function addShowtime(form: FormData) {
  await requireAdmin();
  const enteredDate = text(form, "startsAt");
  db.prepare(
    `
    INSERT INTO showtimes (location_id, movie_id, starts_at, auditorium, price)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(
    number(form, "locationId"),
    number(form, "movieId"),
    new Date(enteredDate).toISOString(),
    text(form, "auditorium"),
    number(form, "price"),
  );
  refresh();
}

export async function deleteShowtime(form: FormData) {
  await requireAdmin();
  db.prepare("DELETE FROM showtimes WHERE id = ?").run(number(form, "id"));
  refresh();
}
