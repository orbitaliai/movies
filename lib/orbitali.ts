import { createHmac, timingSafeEqual } from "node:crypto";

import { getLocations, type Location } from "@/lib/db";

const DEFAULT_TIME_ZONE = "Europe/Madrid";

export type OrbitaliCall = {
  id?: string;
  toNumber?: string;
};

export type OrbitaliEvent = {
  message?: {
    type?: string;
    call?: OrbitaliCall;
    toolCall?: {
      id?: string;
      name?: string;
      arguments?: unknown;
    };
  };
};

function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function phoneLocationMap(rawValue: string | undefined) {
  if (!rawValue?.trim()) return new Map<string, string>();

  try {
    const value: unknown = JSON.parse(rawValue);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return new Map<string, string>();
    }

    return new Map(
      Object.entries(value)
        .filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        )
        .map(([phone, slug]) => [normalizePhoneNumber(phone), slug]),
    );
  } catch {
    return new Map<string, string>();
  }
}

export function resolveLocationForPhone(toNumber: string | undefined) {
  const normalizedNumber = normalizePhoneNumber(toNumber ?? "");
  if (!normalizedNumber) return undefined;

  const locations = getLocations();
  const configuredSlug = phoneLocationMap(
    process.env.ORBITALI_LOCATION_PHONE_MAP,
  ).get(normalizedNumber);

  if (configuredSlug) {
    return locations.find((location) => location.slug === configuredSlug);
  }

  return locations.find(
    (location) => normalizePhoneNumber(location.phone) === normalizedNumber,
  );
}

export function getLocationBySlug(slug: string) {
  return getLocations().find((location) => location.slug === slug);
}

export function verifyOrbitaliSignature({
  secret,
  rawBody,
  signature,
}: {
  secret: string;
  rawBody: string;
  signature: string | null;
}) {
  if (!signature?.startsWith("sha256=")) return false;

  const actual = signature.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(actual)) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function dateKey(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function spokenTime(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function locationFacts(location: Location) {
  return {
    name: location.name,
    slug: location.slug,
    address: location.address,
    city: location.city,
    phone: location.phone,
    description: location.description,
    amenities: location.amenities
      .split(",")
      .map((amenity) => amenity.trim())
      .filter(Boolean),
  };
}

export function buildAssistantResponse(location: Location) {
  const timeZone = process.env.CINEMA_TIME_ZONE?.trim() || DEFAULT_TIME_ZONE;
  const today = dateKey(new Date(), timeZone);

  return {
    prompt: [
      `You are the friendly phone information assistant for ${location.name} in ${location.city}.`,
      `This call is specifically for ${location.name}; its location slug is \"${location.slug}\".`,
      `Today is ${today} in the ${timeZone} time zone.`,
      "Your only responsibilities are answering questions about this cinema's location, contact details, amenities, movies, and showtimes.",
      "Never sell or reserve tickets, take payments, quote ticket prices, transfer calls, or claim that you completed a purchase.",
      "Use get_movie_times for every schedule question so the answer comes from the live cinema database. Always pass the location slug above and an explicit YYYY-MM-DD date.",
      "Use get_location_info when the caller asks about address, phone number, description, or amenities.",
      "Never invent a movie, showtime, amenity, or location detail. If the tool returns no screenings, say that no matching screenings are currently listed.",
      "Keep responses concise and natural for a phone conversation. Ask one short clarifying question when the movie or date is ambiguous.",
      `Known location context: ${JSON.stringify(locationFacts(location))}`,
    ].join("\n"),
    greeting: `Thanks for calling ${location.name}. I can help with movie times and cinema information. What would you like to know?`,
  };
}

export function locationInfo(location: Location) {
  return { ok: true, location: locationFacts(location) };
}

export function movieTimes({
  location,
  date,
  movieTitle,
}: {
  location: Location;
  date?: string;
  movieTitle?: string;
}) {
  const timeZone = process.env.CINEMA_TIME_ZONE?.trim() || DEFAULT_TIME_ZONE;
  const requestedDate = date || dateKey(new Date(), timeZone);
  const normalizedTitle = movieTitle?.trim().toLocaleLowerCase();

  const movies = location.movies
    .filter(
      (movie) =>
        !normalizedTitle ||
        movie.title.toLocaleLowerCase().includes(normalizedTitle),
    )
    .map((movie) => ({
      title: movie.title,
      rating: movie.rating,
      runtimeMinutes: movie.runtimeMinutes,
      genre: movie.genre,
      showtimes: movie.showtimes
        .filter(
          (showtime) =>
            dateKey(new Date(showtime.startsAt), timeZone) === requestedDate,
        )
        .map((showtime) => ({
          startsAt: showtime.startsAt,
          localTime: spokenTime(new Date(showtime.startsAt), timeZone),
          auditorium: showtime.auditorium,
        })),
    }))
    .filter((movie) => movie.showtimes.length > 0);

  return {
    ok: true,
    location: location.name,
    locationSlug: location.slug,
    date: requestedDate,
    timeZone,
    movies,
  };
}
