import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const tmdbId = body.tmdb_id;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const posterPath =
    typeof body.poster_path === "string" ? body.poster_path : null;
  const overview = typeof body.overview === "string" ? body.overview : "";

  if (typeof tmdbId !== "number" || !title) {
    return NextResponse.json(
      { error: "tmdb_id and title are required" },
      { status: 400 }
    );
  }

  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
  if (!list) {
    return NextResponse.json({ error: "list not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("list_movies")
    .insert({
      list_id: params.id,
      tmdb_id: tmdbId,
      title,
      poster_path: posterPath,
      overview,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
