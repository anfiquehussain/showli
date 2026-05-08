// ==========================================
// 1. TYPES
// ==========================================

import type { TmdbGenre, TmdbLanguage, TmdbCountry } from '@/types/tmdb.types';

export interface DiscoveryConfig {
  id: string;
  title: string;
  path: string;
  params: Record<string, string | number | boolean>;
  icon: string;
}

// ==========================================
// 2. ICON MAPPING (HELPER)
// ==========================================

const GENRE_ICON_MAP: Record<number, string> = {
  28: "Zap", // Action
  12: "Compass", // Adventure
  16: "Sparkles", // Animation
  35: "Coffee", // Comedy
  80: "Shield", // Crime
  99: "Clapperboard", // Documentary
  18: "Film", // Drama
  10751: "Heart", // Family
  14: "Sparkles", // Fantasy
  36: "Calendar", // History
  27: "Ghost", // Horror
  10402: "Music", // Music
  9648: "Shield", // Mystery
  10749: "Heart", // Romance
  878: "Rocket", // Sci-Fi
  53: "Zap", // Thriller
  10752: "Flame", // War
  37: "Flame", // Western
  10759: "Zap", // Action & Adventure (TV)
  10765: "Rocket", // Sci-Fi & Fantasy (TV)
};

// ==========================================
// 3. STATIC POOL
// ==========================================

const STATIC_POOL: DiscoveryConfig[] = [
  { id: "trending-today", title: "Trending Today", path: "/trending/all/day", params: {}, icon: "TrendingUp" },
  { id: "trending-week", title: "Top of the Week", path: "/trending/all/week", params: {}, icon: "Flame" },
  { id: "popular-movies", title: "Popular Movies", path: "/movie/popular", params: {}, icon: "Film" },
  { id: "top-rated-movies", title: "All-Time Best Movies", path: "/movie/top_rated", params: {}, icon: "Star" },
  { id: "upcoming-movies", title: "Upcoming Releases", path: "/movie/upcoming", params: {}, icon: "Calendar" },
  { id: "popular-tv", title: "Popular TV Shows", path: "/tv/popular", params: {}, icon: "Tv" },
  { id: "top-rated-tv", title: "Top Rated Series", path: "/tv/top_rated", params: {}, icon: "Star" },
];

// ==========================================
// 4. THE GENERATOR
// ==========================================

export const generateRandomDiscovery = (
  count: number,
  movieGenres: TmdbGenre[] = [],
  tvGenres: TmdbGenre[] = [],
  languages: TmdbLanguage[] = [],
  countries: TmdbCountry[] = []
): DiscoveryConfig[] => {
  const configs: DiscoveryConfig[] = [];
  const usedKeys = new Set<string>();

  const tryAdd = (config: DiscoveryConfig | null) => {
    if (config && !usedKeys.has(config.id)) {
      configs.push(config);
      usedKeys.add(config.id);
      return true;
    }
    return false;
  };

  while (configs.length < count) {
    const strategy = Math.random();
    let config: DiscoveryConfig | null = null;

    // A. Static Strategy (20%)
    if (strategy < 0.2 || (movieGenres.length === 0 && languages.length === 0)) {
      const picked = STATIC_POOL[Math.floor(Math.random() * STATIC_POOL.length)];
      if (!picked) continue;
      config = picked;
    } 
    // B. Genre Strategy (30%)
    else if (strategy < 0.5 && (movieGenres.length > 0 || tvGenres.length > 0)) {
      const isMovie = Math.random() > 0.5;
      const pool = isMovie ? movieGenres : tvGenres;
      if (pool.length === 0) continue;
      
      const genre = pool[Math.floor(Math.random() * pool.length)];
      if (!genre) continue;
      config = {
        id: `genre-${genre.id}-${isMovie ? 'm' : 't'}`,
        title: `${genre.name} ${isMovie ? 'Movies' : 'Series'}`,
        path: isMovie ? "/discover/movie" : "/discover/tv",
        params: { with_genres: genre.id, sort_by: "popularity.desc" },
        icon: GENRE_ICON_MAP[genre.id] || (isMovie ? "Film" : "Tv"),
      };
    } 
    // C. Country/Language Strategy (30%)
    else if (strategy < 0.8 && (languages.length > 0 || countries.length > 0)) {
      const isCountry = Math.random() > 0.5 && countries.length > 0;
      const isMovie = Math.random() > 0.3;

      if (isCountry) {
        const country = countries[Math.floor(Math.random() * countries.length)];
        if (!country) continue;
        // Filter for common/popular countries to avoid empty results
        const popularCodes = ['IN', 'KR', 'JP', 'FR', 'ES', 'US', 'GB', 'DE', 'IT', 'CN', 'TH', 'ML', 'TA'];
        if (!popularCodes.includes(country.iso_3166_1) && Math.random() > 0.1) continue;

        config = {
          id: `country-${country.iso_3166_1}-${isMovie ? 'm' : 't'}`,
          title: `${country.english_name} ${isMovie ? 'Cinema' : 'Shows'}`,
          path: isMovie ? "/discover/movie" : "/discover/tv",
          params: { with_origin_country: country.iso_3166_1, sort_by: "popularity.desc" },
          icon: "Globe",
        };
      } else {
        const lang = languages[Math.floor(Math.random() * languages.length)];
        if (!lang) continue;
        // Filter for common languages
        const popularLangs = ['en', 'hi', 'ml', 'ta', 'te', 'ko', 'ja', 'fr', 'es', 'zh', 'it', 'de'];
        if (!popularLangs.includes(lang.iso_639_1) && Math.random() > 0.1) continue;

        config = {
          id: `lang-${lang.iso_639_1}-${isMovie ? 'm' : 't'}`,
          title: `${lang.english_name} ${isMovie ? 'Cinema' : 'TV'}`,
          path: isMovie ? "/discover/movie" : "/discover/tv",
          params: { with_original_language: lang.iso_639_1, sort_by: "popularity.desc" },
          icon: "Globe",
        };
      }
    } 
    // D. Combo Strategy (20%)
    else {
      const isMovie = Math.random() > 0.4;
      const genrePool = isMovie ? movieGenres : tvGenres;
      if (genrePool.length === 0 || languages.length === 0) continue;

      const genre = genrePool[Math.floor(Math.random() * genrePool.length)];
      const lang = languages[Math.floor(Math.random() * languages.length)];
      
      if (!genre || !lang) continue;

      const popularLangs = ['en', 'hi', 'ml', 'ta', 'te', 'ko', 'ja', 'fr', 'es', 'zh'];
      if (!popularLangs.includes(lang.iso_639_1) && Math.random() > 0.05) continue;

      config = {
        id: `combo-${lang.iso_639_1}-${genre.id}`,
        title: `${lang.english_name} ${genre.name}`,
        path: isMovie ? "/discover/movie" : "/discover/tv",
        params: { with_original_language: lang.iso_639_1, with_genres: genre.id, sort_by: "popularity.desc" },
        icon: GENRE_ICON_MAP[genre.id] || "Sparkles",
      };
    }

    tryAdd(config);
  }

  return configs.sort(() => Math.random() - 0.5);
};
