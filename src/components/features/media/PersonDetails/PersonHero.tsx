import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, MapPin, Star, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbPersonDetails } from '@/types/tmdb.types';

interface PersonHeroProps {
  person: TmdbPersonDetails;
  bannerPath?: string | null;
}

const PersonHero = ({ person, bannerPath }: PersonHeroProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[300px] md:min-h-[400px] flex flex-col justify-end">
      {/* Background Layer - Use latest movie banner if available, else dynamic gradient */}
      <div className="absolute inset-0 w-full h-[85%] overflow-hidden bg-black">
        {bannerPath ? (
          <img
            src={getTmdbImageUrl(bannerPath, 'original')}
            alt=""
            className="w-full h-full object-cover object-top opacity-50 blur-[2px] scale-100"
            aria-hidden="true"
          />
        ) : person.profile_path ? (
          <div className="absolute inset-0">
            <img
              src={getTmdbImageUrl(person.profile_path, 'w500')}
              alt=""
              className="w-full h-full object-cover object-center opacity-40 blur-[100px] scale-150"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all text-white z-30 shadow-lg active:scale-95"
        aria-label="Go back"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="container mx-auto px-4 md:px-8 relative z-20 pb-4">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8">
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative shrink-0 w-32 sm:w-40 md:w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 group/poster bg-white/5"
          >
            {person.profile_path ? (
              <img
                src={getTmdbImageUrl(person.profile_path, 'h632')}
                alt={person.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                <Star className="w-12 h-12 mb-2" />
                <span className="text-xs uppercase font-bold tracking-widest">No Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Identity Block */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 space-y-3 pb-1 md:pb-2 text-center md:text-left w-full"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {person.known_for_department && (
                  <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold backdrop-blur-md bg-white/5 px-2 py-0.5 rounded-md border border-white/10 uppercase">
                    {person.known_for_department}
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-white tracking-tight leading-tight text-pretty">
                {person.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {person.birthday && (
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <Calendar className="w-4 h-4 text-brand-secondary" />
                  <span>
                    Born {new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {person.deathday && ` - Died ${new Date(person.deathday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-3">
              <button 
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white flex items-center justify-center"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: person.name,
                      text: `Check out ${person.name} on ShowLi`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PersonHero;
