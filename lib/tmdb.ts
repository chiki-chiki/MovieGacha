export interface TmdbSearchResult {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  overview: string;
}

interface TmdbApiMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
}

interface TmdbApiSearchResponse {
  results: TmdbApiMovie[];
}

export async function searchTmdbMovies(
  query: string
): Promise<TmdbSearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY must be set. See .env.example.");
  }

  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("language", "ja-JP");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB search request failed: ${response.status}`);
  }

  const data = (await response.json()) as TmdbApiSearchResponse;
  return data.results.map((movie) => ({
    tmdb_id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    overview: movie.overview,
  }));
}
