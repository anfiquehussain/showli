import { useGetMediaKeywordsQuery } from '@/api/media/mediaApi';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import type { TmdbKeyword } from '@/types/tmdb.types';

interface MediaKeywordsProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaKeywords = ({ id, type }: MediaKeywordsProps) => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMediaKeywordsQuery({ type, id });

  const keywords: TmdbKeyword[] | undefined = type === 'movie' ? data?.keywords : data?.results;

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!keywords || keywords.length === 0) return null;

  const handleKeywordClick = (id: number, name: string) => {
    navigate(`/browse?keyword=${id}&keywordName=${encodeURIComponent(name)}`);
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-6 shadow-xl shadow-black/20">
      <div className="space-y-1.5">
        <h3 className="text-lg font-black text-white flex items-center gap-3">
          <Tag className="w-5 h-5 text-brand-primary" />
          Keywords
        </h3>
        <div className="h-px w-8 bg-brand-primary/50 rounded-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <button
            key={keyword.id}
            onClick={() => handleKeywordClick(keyword.id, keyword.name)}
            className="px-3 py-1.5 text-xs font-bold text-white/60 bg-white/5 border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl cursor-pointer transition-colors duration-300 transform hover:scale-[1.02] active:scale-95"
          >
            {keyword.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MediaKeywords;
