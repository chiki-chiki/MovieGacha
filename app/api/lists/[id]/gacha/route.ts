import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { data: movies, error: moviesError } = await supabase
    .from("list_movies")
    .select("*")
    .eq("list_id", params.id);

  if (moviesError) {
    return NextResponse.json({ error: moviesError.message }, { status: 500 });
  }
  if (!movies || movies.length === 0) {
    return NextResponse.json({ error: "list has no movies" }, { status: 404 });
  }

  const selected = movies[Math.floor(Math.random() * movies.length)];

  return NextResponse.json(selected);
}
