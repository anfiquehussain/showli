import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { User, ChevronRight, Search } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbCastMember, TmdbCrewMember } from '@/types/tmdb.types';
import ScrollContainer from '@/components/patterns/ScrollContainer';
import Modal from '@/components/patterns/Modal';

interface EpisodeCreditsProps {
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
  guestStars?: TmdbCastMember[];
}

const EpisodeCredits = ({ cast = [], crew = [], guestStars = [] }: EpisodeCreditsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cast' | 'guest' | 'crew'>('cast');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter key behind-the-scenes crew members for this episode
  const prominentJobs = ['Director', 'Writer', 'Teleplay', 'Story', 'Producer', 'Executive Producer'];
  const topCrew = crew.filter((person) => prominentJobs.includes(person.job || ''));
  const displayCrew = topCrew.length > 0 ? topCrew : crew.slice(0, 10);

  // Search filtering inside full credits modal
  const query = searchQuery.toLowerCase();
  
  const filteredCast = cast.filter(person => 
    person.name.toLowerCase().includes(query) || 
    person.character?.toLowerCase().includes(query)
  );

  const filteredGuest = guestStars.filter(person => 
    person.name.toLowerCase().includes(query) || 
    person.character?.toLowerCase().includes(query)
  );

  const filteredCrew = crew.filter(person => 
    person.name.toLowerCase().includes(query) || 
    person.job?.toLowerCase().includes(query) ||
    person.department.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-8">
      {/* 1. EPISODE CAST */}
      {cast.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Episode Cast
            </h2>

            {cast.length > 6 && (
              <button
                onClick={() => { setActiveTab('cast'); setIsModalOpen(true); }}
                className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                View Full Credits
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <ScrollContainer className="gap-4 pb-4">
            {cast.slice(0, 10).map((person: TmdbCastMember) => (
              <Link 
                key={person.id} 
                to={`/person/${person.id}`}
                className="shrink-0 w-24 md:w-32 group block"
              >
                <div className="aspect-2/3 rounded-2xl bg-white/5 border border-white/5 overflow-hidden mb-3 group-hover:border-brand-primary/50 transition-colors">
                  {person.profile_path ? (
                    <img 
                      src={getTmdbImageUrl(person.profile_path, 'w185')} 
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-bold text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {person.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {person.character}
                  </p>
                </div>
              </Link>
            ))}
          </ScrollContainer>
        </section>
      )}

      {/* 2. GUEST STARS */}
      {guestStars.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Guest Stars
            </h2>

            {guestStars.length > 6 && (
              <button
                onClick={() => { setActiveTab('guest'); setIsModalOpen(true); }}
                className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                View Guest Stars ({guestStars.length})
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <ScrollContainer className="gap-4 pb-4">
            {guestStars.slice(0, 10).map((person: TmdbCastMember) => (
              <Link 
                key={person.id} 
                to={`/person/${person.id}`}
                className="shrink-0 w-24 md:w-32 group block"
              >
                <div className="aspect-2/3 rounded-2xl bg-white/5 border border-white/5 overflow-hidden mb-3 group-hover:border-brand-primary/50 transition-colors">
                  {person.profile_path ? (
                    <img 
                      src={getTmdbImageUrl(person.profile_path, 'w185')} 
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-bold text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {person.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {person.character}
                  </p>
                </div>
              </Link>
            ))}
          </ScrollContainer>
        </section>
      )}

      {/* 3. EPISODE CREW */}
      {displayCrew.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Behind the Episode
            </h2>

            {crew.length > 6 && (
              <button
                onClick={() => { setActiveTab('crew'); setIsModalOpen(true); }}
                className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors cursor-pointer"
              >
                View Full Crew ({crew.length})
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <ScrollContainer className="gap-3 pb-4">
            {displayCrew.map((person: TmdbCrewMember, idx) => (
              <Link 
                key={`${person.id}-${idx}`} 
                to={`/person/${person.id}`}
                className="shrink-0 w-36 md:w-48 group bg-white/5 border border-white/5 rounded-2xl p-2.5 flex items-center gap-3 hover:border-brand-primary/30 hover:bg-white/7 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:border-brand-primary/50 transition-colors">
                  {person.profile_path ? (
                    <img 
                      src={getTmdbImageUrl(person.profile_path, 'w185')} 
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-bold text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {person.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 font-medium">
                    {person.job}
                  </p>
                </div>
              </Link>
            ))}
          </ScrollContainer>
        </section>
      )}

      {/* VIEW FULL CREDITS MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title="Episode Credits"
            maxWidth="max-w-4xl"
          >
            <div className="space-y-6">
              {/* Search & Tabs */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="text"
                    placeholder={`Search in ${activeTab}…`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus:border-brand-primary/50 focus:bg-white/8 transition-colors"
                  />
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-full md:w-auto shrink-0">
                  {cast.length > 0 && (
                    <button
                      onClick={() => { setActiveTab('cast'); setSearchQuery(''); }}
                      className={`flex-1 md:flex-none md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'cast' 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Cast ({cast.length})
                    </button>
                  )}
                  {guestStars.length > 0 && (
                    <button
                      onClick={() => { setActiveTab('guest'); setSearchQuery(''); }}
                      className={`flex-1 md:flex-none md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'guest' 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Guests ({guestStars.length})
                    </button>
                  )}
                  {crew.length > 0 && (
                    <button
                      onClick={() => { setActiveTab('crew'); setSearchQuery(''); }}
                      className={`flex-1 md:flex-none md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'crew' 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Crew ({crew.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Content */}
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2 sm:gap-x-4 gap-y-4 sm:gap-y-6">
                  {/* Cast Rendering */}
                  {activeTab === 'cast' && filteredCast.map((person, idx) => (
                    <Link 
                      key={`${person.id}-${idx}`}
                      to={`/person/${person.id}`}
                      onClick={() => setIsModalOpen(false)}
                      className="flex flex-col group"
                    >
                      <div className="aspect-2/3 rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-brand-primary/50 transition-colors duration-300 mb-3 shadow-lg">
                        {person.profile_path ? (
                          <img 
                            src={getTmdbImageUrl(person.profile_path, 'w185')} 
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 px-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                          {person.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                          {person.character}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {/* Guest Stars Rendering */}
                  {activeTab === 'guest' && filteredGuest.map((person, idx) => (
                    <Link 
                      key={`${person.id}-${idx}`}
                      to={`/person/${person.id}`}
                      onClick={() => setIsModalOpen(false)}
                      className="flex flex-col group"
                    >
                      <div className="aspect-2/3 rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-brand-primary/50 transition-colors duration-300 mb-3 shadow-lg">
                        {person.profile_path ? (
                          <img 
                            src={getTmdbImageUrl(person.profile_path, 'w185')} 
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 px-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                          {person.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                          {person.character}
                        </p>
                      </div>
                    </Link>
                  ))}

                  {/* Crew Rendering */}
                  {activeTab === 'crew' && filteredCrew.map((person, idx) => (
                    <Link 
                      key={`${person.id}-${idx}`}
                      to={`/person/${person.id}`}
                      onClick={() => setIsModalOpen(false)}
                      className="flex flex-col group"
                    >
                      <div className="aspect-2/3 rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-brand-primary/50 transition-colors duration-300 mb-3 shadow-lg">
                        {person.profile_path ? (
                          <img 
                            src={getTmdbImageUrl(person.profile_path, 'w185')} 
                            alt={person.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 px-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                          {person.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                          {person.job} • {person.department}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] bg-white/5 text-white hover:bg-brand-primary transition-colors shadow-xl border border-white/10 hover:border-brand-primary/50 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EpisodeCredits;
