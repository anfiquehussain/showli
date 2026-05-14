import { useState } from 'react';
import { Film } from 'lucide-react';
import type { TmdbPersonCombinedCredits, TmdbMedia } from '@/types/tmdb.types';
import MediaScroll from '@/components/patterns/MediaScroll';
import PersonAllCreditsModal from './PersonAllCreditsModal';

interface PersonCreditsProps {
  credits: TmdbPersonCombinedCredits;
  personName: string;
}

const PersonCredits = ({ credits, personName }: PersonCreditsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine cast and crew
  const allCredits = [...credits.cast, ...credits.crew];
  
  // Remove duplicates (someone could be both director and actor in the same movie)
  const uniqueCreditsMap = new Map<number, TmdbMedia>();
  allCredits.forEach(credit => {
    if (!uniqueCreditsMap.has(credit.id)) {
      uniqueCreditsMap.set(credit.id, credit);
    }
  });

  const uniqueCredits = Array.from(uniqueCreditsMap.values());

  // Sort by popularity or vote_count to get "Known For"
  // vote_count is usually a better indicator of how "known" a movie is
  const knownFor = uniqueCredits
    .filter(credit => credit.vote_count && credit.vote_count > 0)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 20);

  if (knownFor.length === 0) return null;

  return (
    <section className="space-y-4">
      <MediaScroll
        title="Known For"
        icon={<Film className="w-4 h-4 text-brand-secondary" />}
        items={knownFor}
        onViewAll={() => setIsModalOpen(true)}
        viewAllLabel={`View All (${uniqueCredits.length})`}
      />

      <PersonAllCreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        credits={uniqueCredits}
        personName={personName}
      />
    </section>
  );
};

export default PersonCredits;
