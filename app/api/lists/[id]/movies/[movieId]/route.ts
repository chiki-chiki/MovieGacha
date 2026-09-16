import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; movieId: string } }
) {
  const { data: movie, error: movieError } = await supabase
    .from("list_movies")
    .select("id")
    .eq("id", params.movieId)
    .eq("list_id", params.id)
    .maybeSingle();

  if (movieError) {
    return NextResponse.json({ error: movieError.message }, { status: 500 });
  }
  if (!movie) {
    return NextResponse.json({ error: "movie not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("list_movies")
    .delete()
    .eq("id", params.movieId)
    .eq("list_id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
