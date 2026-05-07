import * as React from 'react';
import { Search, X } from 'lucide-react';
import Input, { type InputProps } from '@/components/ui/Input';
import IconButton from '@/components/ui/IconButton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SearchBarProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onClear, containerClassName, className, ...props }, ref) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={cn("relative w-full max-w-sm", containerClassName)}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary z-10 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        
        <Input
          {...props}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "pl-11 pr-11 h-10 text-sm bg-white/5 border-white/10 hover:bg-white/10 transition-colors",
            className
          )}
        />

        {value && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <IconButton
              icon={X}
              onClick={handleClear}
              variant="ghost"
              className="w-7 h-7 p-1.5 text-text-secondary hover:text-white"
              aria-label="Clear search"
            />
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
