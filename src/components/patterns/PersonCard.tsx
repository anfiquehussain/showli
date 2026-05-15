import { Link } from 'react-router-dom';
import { User, Star } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbPersonDetails } from '@/types/tmdb.types';
import { motion } from 'framer-motion';

interface PersonCardProps {
  person: TmdbPersonDetails;
}

export const PersonCard = ({ person }: PersonCardProps) => {
  return (
    <Link to={`/person/${person.id}`} className="block group">
      <div className="flex flex-col items-center text-center space-y-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-brand-primary/50 transition-standard shadow-xl"
        >
          {person.profile_path ? (
            <img
              src={getTmdbImageUrl(person.profile_path, 'w185')}
              alt={person.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        <div className="space-y-1">
          <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1">
            {person.name}
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-medium">
            <Star className="w-3 h-3 text-warning fill-current" />
            <span>{person.popularity.toFixed(0)} score</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
