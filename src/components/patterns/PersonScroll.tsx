import type { ReactNode } from 'react';
import type { TmdbPersonDetails } from '@/types/tmdb.types';
import { PersonCard } from './PersonCard';
import ScrollContainer from './ScrollContainer';

interface PersonScrollProps {
  title: string;
  icon: ReactNode;
  items: TmdbPersonDetails[];
  isLoading?: boolean;
}

const PersonScroll = ({ title, icon, items, isLoading }: PersonScrollProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2 h-6 w-32 bg-card/50 animate-pulse rounded" />
        <div className="flex gap-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="shrink-0 w-28 md:w-36 aspect-square rounded-full bg-card/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 py-4 group/section">
      <div className="flex items-center gap-2 text-brand-secondary font-medium text-sm uppercase tracking-wider">
        {icon}
        <span>{title}</span>
      </div>
      
      <ScrollContainer className="gap-6 pb-4">
        {items.map((person) => (
          <div key={person.id} className="shrink-0">
            <PersonCard person={person} />
          </div>
        ))}
      </ScrollContainer>
    </div>
  );
};

export default PersonScroll;
