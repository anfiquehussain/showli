import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationControlsProps) => {
  const [jumpValue, setJumpValue] = useState('');

  if (totalPages <= 1) return null;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpValue);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpValue('');
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis-start');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis-end');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 p-0"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (typeof page === 'string') {
              return (
                <div 
                  key={`ellipsis-${index}`}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 p-0 ${currentPage === page ? 'shadow-lg shadow-brand-primary/20' : 'bg-white/5 border-white/5'}`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 p-0"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleJump} className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
        <span className="text-xs text-muted-foreground px-2 hidden lg:inline">Jump to page</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          placeholder={String(currentPage)}
          className="w-12 h-8 bg-transparent border-none text-center text-sm focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30"
        />
        <Button 
          type="submit" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
          disabled={!jumpValue}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default PaginationControls;
