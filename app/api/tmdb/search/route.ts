import { NextRequest, NextResponse } from "next/server";
import { searchTmdbMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json(
      { error: "query parameter is required" },
      { status: 400 }
    );
  }

  const results = await searchTmdbMovies(query);
  return NextResponse.json({ results });
}
