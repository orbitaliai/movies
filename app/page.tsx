import { getLocations } from "@/lib/db";
import { CinemaHome } from "@/components/cinema-home";

export const dynamic = "force-dynamic";

export default function Home() {
  return <CinemaHome locations={getLocations()} />;
}
