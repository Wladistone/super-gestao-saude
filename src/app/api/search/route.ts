import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ totalResultados: 0, termo: "", resultados: null });
  }

  const results = dataStore.busca360(q);
  return NextResponse.json(results);
}
