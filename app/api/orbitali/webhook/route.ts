import { NextResponse } from "next/server";

import {
  buildAssistantResponse,
  getLocationBySlug,
  locationInfo,
  movieTimes,
  resolveLocationForPhone,
  type OrbitaliEvent,
  verifyOrbitaliSignature,
} from "@/lib/orbitali";

export const runtime = "nodejs";

function objectArguments(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringArgument(
  argumentsObject: Record<string, unknown>,
  name: string,
) {
  const value = argumentsObject[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.ORBITALI_WEBHOOK_SECRET?.trim();

  if (
    secret &&
    !verifyOrbitaliSignature({
      secret,
      rawBody,
      signature: request.headers.get("x-orbitali-signature"),
    })
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: OrbitaliEvent;
  try {
    event = JSON.parse(rawBody) as OrbitaliEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.message?.type;
  const headerEventType = request.headers.get("x-orbitali-event-type");
  if (headerEventType && eventType !== headerEventType) {
    return NextResponse.json({ error: "Event type mismatch" }, { status: 400 });
  }

  if (eventType === "agent:assistant-request") {
    const location = resolveLocationForPhone(event.message?.call?.toNumber);
    if (!location) {
      return NextResponse.json(
        {
          error: "No cinema location is mapped to the called phone number",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(buildAssistantResponse(location));
  }

  if (eventType === "agent:tool-call") {
    const toolCall = event.message?.toolCall;
    const argumentsObject = objectArguments(toolCall?.arguments);
    const locationSlug = stringArgument(argumentsObject, "locationSlug");
    const location = locationSlug
      ? getLocationBySlug(locationSlug)
      : resolveLocationForPhone(event.message?.call?.toNumber);

    if (!location) {
      return NextResponse.json(
        { ok: false, error: "Cinema location not found" },
        { status: 404 },
      );
    }

    if (toolCall?.name === "get_location_info") {
      return NextResponse.json(locationInfo(location));
    }

    if (toolCall?.name === "get_movie_times") {
      const date = stringArgument(argumentsObject, "date");
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { ok: false, error: "date must use YYYY-MM-DD format" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        movieTimes({
          location,
          date,
          movieTitle: stringArgument(argumentsObject, "movieTitle"),
        }),
      );
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported tool" },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
}
