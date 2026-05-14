import Modal from '@/components/patterns/Modal';
import { Link } from 'react-router-dom';
import { useGetCreditsQuery, useGetTVCreditsQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import { User, Search } from 'lucide-react';
import { useState } from 'react';
import type { TmdbCastMember, TmdbCrewMember } from '@/types/tmdb.types';

interface FullCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  type: 'movie' | 'tv';
  title: string;
}

const FullCreditsModal = ({ isOpen, onClose, id, type, title }: FullCreditsModalProps) => {
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>('cast');
  const [searchQuery, setSearchQuery] = useState('');
  
  const movieCredits = useGetCreditsQuery(id, { skip: type !== 'movie' || !isOpen });
  const tvCredits = useGetTVCreditsQuery(id, { skip: type !== 'tv' || !isOpen });

  const credits = type === 'movie' ? movieCredits.data : tvCredits.data;
  const isLoading = movieCredits.isLoading || tvCredits.isLoading;

  const query = searchQuery.toLowerCase();

  const cast = (credits?.cast || []).filter(person => 
    person.name.toLowerCase().includes(query) || 
    (type === 'movie' ? person.character?.toLowerCase().includes(query) : person.roles?.[0]?.character?.toLowerCase().includes(query))
  );

  const crew = (credits?.crew || []).filter(person => 
    person.name.toLowerCase().includes(query) || 
    (type === 'movie' ? person.job?.toLowerCase().includes(query) : person.jobs?.[0]?.job?.toLowerCase().includes(query)) ||
    person.department.toLowerCase().includes(query)
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Credits — ${title}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Search & Tabs Header */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input 
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('cast')}
              className={`flex-1 md:flex-none md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'cast' 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              Cast ({cast.length})
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`flex-1 md:flex-none md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'crew' 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              Crew ({crew.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2 sm:gap-x-4 gap-y-4 sm:gap-y-6">
              {(activeTab === 'cast' ? cast : crew).map((person, idx) => (
                <Link 
                  key={`${person.id}-${idx}`}
                  to={`/person/${person.id}`}
                  onClick={onClose}
                  className="flex flex-col group block"
                >
                  <div className="aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-brand-primary/50 transition-all duration-300 mb-2 sm:mb-3 shadow-lg">
                    {person.profile_path ? (
                      <img 
                        src={getTmdbImageUrl(person.profile_path, 'w185')} 
                        alt={person.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 sm:w-8 sm:h-8 text-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 px-0.5">
                    <h4 className="text-[10px] sm:text-[12px] font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                      {person.name}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-2 leading-tight font-medium">
                      {activeTab === 'cast' 
                        ? (type === 'movie' 
                            ? (person as TmdbCastMember).character 
                            : (person as TmdbCastMember).roles?.[0]?.character)
                        : (type === 'movie' 
                            ? (person as TmdbCrewMember).job 
                            : (person as TmdbCrewMember).jobs?.[0]?.job)
                      }
                      {activeTab === 'crew' && ` • ${(person as TmdbCrewMember).department}`}
                    </p>
                    {person.total_episode_count && (
                      <p className="text-[8px] sm:text-[9px] text-brand-primary font-black uppercase tracking-tighter pt-0.5">
                        {person.total_episode_count} Episodes
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              {((activeTab === 'cast' ? cast : crew).length === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] bg-white/5 text-white hover:bg-brand-primary transition-all shadow-xl border border-white/10 hover:border-brand-primary/50"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FullCreditsModal;
