import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const creatorName =
    typeof body.creator_name === "string" ? body.creator_name.trim() : "";

  if (!name || !creatorName) {
    return NextResponse.json(
      { error: "name and creator_name are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("lists")
    .insert({ name, creator_name: creatorName })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
