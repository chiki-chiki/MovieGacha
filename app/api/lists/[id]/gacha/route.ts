import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data: movies, error } = await supabase
    .from("list_movies")
    .select()
    .eq("list_id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (movies.length === 0) {
    return NextResponse.json(
      { error: "list has no movies to draw from" },
      { status: 404 }
    );
  }

  const picked = movies[Math.floor(Math.random() * movies.length)];
  return NextResponse.json(picked);
}
