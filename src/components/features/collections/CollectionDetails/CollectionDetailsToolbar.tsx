import { LayoutGrid, Columns2, Dices } from 'lucide-react';
import type { MediaStatus } from '@/types/collections.types';
import SearchBar from '@/components/patterns/SearchBar';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';

interface CollectionDetailsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: MediaStatus | 'all';
  onFilterChange: (status: MediaStatus | 'all') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onRandomPick: () => void;
  showRandomPick: boolean;
}

const CollectionDetailsToolbar = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onRandomPick,
  showRandomPick
}: CollectionDetailsToolbarProps) => {
  const statusFilters: { value: MediaStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'planned', label: 'Planned' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Watched' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search in collection..."
          containerClassName="w-full sm:max-w-[280px]"
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`
                px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all
                ${filterStatus === filter.value
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'}
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showRandomPick && (
          <Button
            onClick={onRandomPick}
            variant="secondary"
            size="sm"
            className="rounded-xl h-9 px-3 flex items-center gap-2 bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/20"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline">Pick Random</span>
          </Button>
        )}
        <div className="flex items-center gap-1 glass-card p-1 rounded-xl self-end sm:self-auto">
          <IconButton
            icon={LayoutGrid}
            onClick={() => onViewModeChange('grid')}
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            className="w-8 h-8 p-1.5"
            aria-label="Grid view"
          />
          <IconButton
            icon={Columns2}
            onClick={() => onViewModeChange('list')}
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            className="w-8 h-8 p-1.5"
            aria-label="List view"
          />
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailsToolbar;
