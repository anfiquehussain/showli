import type { ComponentType } from 'react';
import { 
  Zap, 
  Ghost, 
  Heart, 
  Rocket, 
  Compass,
  Smile,
  Shield,
  Clapperboard,
  Flame,
  Sparkles,
  Music,
  Play,
  Tv,
  Film,
  History
} from 'lucide-react';

export interface QuickBrowseCategory {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  genreId: number;
  discoverParams?: Record<string, string | number>;
  path?: string;
}

// Genres
export const CATEGORIES: QuickBrowseCategory[] = [
  { id: 'action', name: 'Action', icon: Zap, color: 'bg-palette-orange/10 text-palette-orange', genreId: 28 },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: 'bg-palette-cyan/10 text-palette-cyan', genreId: 12 },
  { id: 'comedy', name: 'Comedy', icon: Smile, color: 'bg-palette-yellow/10 text-palette-yellow', genreId: 35 },
  { id: 'drama', name: 'Drama', icon: Clapperboard, color: 'bg-palette-indigo/10 text-palette-indigo', genreId: 18 },
  { id: 'horror', name: 'Horror', icon: Ghost, color: 'bg-palette-violet/10 text-palette-violet', genreId: 27 },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'bg-palette-pink/10 text-palette-pink', genreId: 10749 },
  { id: 'scifi', name: 'Sci-Fi', icon: Rocket, color: 'bg-palette-blue/10 text-palette-blue', genreId: 878 },
  { id: 'crime', name: 'Crime', icon: Shield, color: 'bg-palette-rose/10 text-palette-rose', genreId: 80 },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, color: 'bg-palette-lime/10 text-palette-lime', genreId: 14 },
  { id: 'thriller', name: 'Thriller', icon: Flame, color: 'bg-palette-amber/10 text-palette-amber', genreId: 53 },
  { id: 'animation', name: 'Animation', icon: Play, color: 'bg-palette-orange/10 text-palette-orange', genreId: 16 },
  { 
    id: 'anime', 
    name: 'Anime', 
    icon: Tv, 
    color: 'bg-palette-pink/10 text-palette-pink', 
    genreId: 16, 
    discoverParams: { with_genres: 16, with_original_language: 'ja' }, 
    path: '/browse?genre=16&language=ja' 
  },
  { 
    id: 'malayalam', 
    name: 'Malayalam', 
    icon: Film, 
    color: 'bg-palette-emerald/10 text-palette-emerald', 
    genreId: 0, 
    discoverParams: { with_original_language: 'ml' }, 
    path: '/browse?language=ml' 
  },
  { 
    id: 'tamil', 
    name: 'Tamil', 
    icon: Film, 
    color: 'bg-palette-orange/10 text-palette-orange', 
    genreId: 0, 
    discoverParams: { with_original_language: 'ta' }, 
    path: '/browse?language=ta' 
  },
  { 
    id: 'mature', 
    name: 'Romantic Mature', 
    icon: Heart, 
    color: 'bg-palette-pink/10 text-palette-pink', 
    genreId: 10749, 
    discoverParams: { with_genres: 10749, certification_country: 'US', certification: 'R' }, 
    path: '/browse?genre=10749&certification=R' 
  },
  { 
    id: 'classics80s', 
    name: '80s Classics', 
    icon: History, 
    color: 'bg-palette-amber/10 text-palette-amber', 
    genreId: 0, 
    discoverParams: { 'primary_release_date.gte': '1980-01-01', 'primary_release_date.lte': '1989-12-31' }, 
    path: '/browse?year=1980' 
  },
  { 
    id: 'fun', 
    name: 'Fun to Watch', 
    icon: Smile, 
    color: 'bg-palette-yellow/10 text-palette-yellow', 
    genreId: 0, 
    discoverParams: { with_genres: '35|12|10751' }, 
    path: '/browse?genre=35' 
  },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-palette-emerald/10 text-palette-emerald', genreId: 10402 },
];

// Popular Production Companies
export const POPULAR_COMPANIES = [
  { id: 420, name: 'Marvel Studios', logoPath: '/hUzeosd33nzE5MCNsZxCGEKTXaQ.png' },
  { id: 3, name: 'Pixar', logoPath: '/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png' },
  { id: 41077, name: 'A24', logoPath: '/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png' },
  { id: 10342, name: 'Studio Ghibli', logoPath: '/uFuxPEZRUcBTEiYIxjHJq62Vr77.png' },
  { id: 174, name: 'Warner Bros.', logoPath: '/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png' },
  { id: 2, name: 'Walt Disney', logoPath: '/wdrCwmRnLFJhEoH8GSfymY85KHT.png' },
  { id: 33, name: 'Universal', logoPath: '/8lvHyhjr8oUKOOy2dKXoALWKdp0.png' },
  { id: 4, name: 'Paramount', logoPath: '/jay6WcMgagAklUt7i9Euwj1pzTF.png' },
  { id: 5, name: 'Columbia', logoPath: '/71BqEFAF4V3qjjMPCpLuyJFB9A.png' },
  { id: 7, name: 'DreamWorks', logoPath: '/zcKhWbxFJ4CohZ9dLBMxmOArTVn.png' },
  { id: 12, name: 'New Line', logoPath: '/2ycs64eqV5rqKYHyQK0GVoKGvfX.png' },
  { id: 14, name: 'Miramax', logoPath: '/m6AHu84oZQxvq7n1rsvMNJIAsMu.png' },
  { id: 21, name: 'MGM', logoPath: '/usUnaYV6hQnlVAXP6r4HwrlLFPG.png' },
  { id: 34, name: 'Sony Pictures', logoPath: '/fl0GumpYvcu7cTHZlNNAMs8heP6.png', invertLogo: true },
  { id: 923, name: 'Legendary', logoPath: '/5UQsZrfbfG2dYJbx8DxfoTr2Bvu.png' },
  { id: 1632, name: 'Lionsgate', logoPath: '/cisLn1YAUuptXVBa0xjq7ST9cH0.png' },
  { id: 3172, name: 'Blumhouse', logoPath: '/rzKluDcRkIwHZK2pHsiT667A2Kw.png' },
  { id: 3268, name: 'HBO', logoPath: '/tuomPhY2UtuPTqqFnKMVHvSb724.png' },
  { id: 10146, name: 'Focus Features', logoPath: '/xnFIOeq5cKw09kCWqV7foWDe4AA.png' },
  { id: 288, name: 'BBC Film', logoPath: '/aW0IpM9d4Zjj978EqgDVSxXXhTj.png' },
  { id: 41, name: 'Orion', logoPath: '/em0rOXVRu3qprWZCx58uDDV2fze.png' },
  { id: 43, name: 'Searchlight', logoPath: '/4RgIPr55kBakgupWkzdDxqXJEqr.png' },
  { id: 56, name: 'Amblin', logoPath: '/cEaxANEisCqeEoRvODv2dO1I0iI.png' },
  { id: 559, name: 'TriStar', logoPath: '/eC0bWHVjnjUducyA6YFoEFqnPMC.png' },
];

// Popular Countries
export const POPULAR_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
];

// Popular Languages
export const POPULAR_LANGUAGES = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'es', name: 'Spanish', label: 'ES' },
  { code: 'ml', name: 'Malayalam', label: 'ML' },
  { code: 'ja', name: 'Japanese', label: 'JA' },
  { code: 'ko', name: 'Korean', label: 'KO' },
  { code: 'hi', name: 'Hindi', label: 'HI' },
  { code: 'ta', name: 'Tamil', label: 'TA' },
  { code: 'tr', name: 'Turkish', label: 'TR' },
  { code: 'fa', name: 'Persian', label: 'FA' },
  { code: 'tl', name: 'Filipino', label: 'TL' },
  { code: 'fr', name: 'French', label: 'FR' },
  { code: 'it', name: 'Italian', label: 'IT' },
  { code: 'de', name: 'German', label: 'DE' },
];

// Years & Decades
export const POPULAR_YEARS = [
  { id: '2026', name: '2026', type: 'year', value: '2026' },
  { id: '2025', name: '2025', type: 'year', value: '2025' },
  { id: '2024', name: '2024', type: 'year', value: '2024' },
  { id: '2023', name: '2023', type: 'year', value: '2023' },
  { id: '2019', name: '2019', type: 'year', value: '2019' },
  { id: '2008', name: '2008', type: 'year', value: '2008' },
  { id: '1999', name: '1999', type: 'year', value: '1999' },
  { id: '1994', name: '1994', type: 'year', value: '1994' },
];
