import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface ScrollContainerProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  showButtons?: boolean;
  size?: 'sm' | 'md';
}

const ScrollContainer = ({
  children,
  className,
  containerClassName,
  showButtons = true,
  size = 'md'
}: ScrollContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 20);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    // Check after content might have loaded
    const timer = setTimeout(checkScroll, 500);

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.7;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const buttonClasses = size === 'sm'
    ? "w-8 h-8 rounded-full"
    : "w-10 h-10 rounded-full";

  const iconSize = size === 'sm' ? "w-4 h-4" : "w-6 h-6";
  const offsetClasses = size === 'sm'
    ? "md:-translate-x-4"
    : "md:-translate-x-6";
  const offsetRightClasses = size === 'sm'
    ? "md:translate-x-4"
    : "md:translate-x-6";

  return (
    <div className={clsx("group/scroll relative px-2 md:px-0", containerClassName)}>
      <div
        ref={scrollRef}
        className={clsx(
          "flex overflow-x-auto no-scrollbar scroll-smooth",
          className
        )}
      >
        {children}
      </div>

      {/* Navigation Buttons - Only visible on hover in MD+ screens */}
      {showButtons && (
        <>
          <button
            onClick={() => scroll('left')}
            disabled={!showLeft}
            className={clsx(
              "absolute left-0 top-[calc(50%+2px)] md:top-[calc(50%-4px)] -translate-y-1/2 -translate-x-2 flex items-center justify-center text-white transition-all duration-300 z-10",
              "bg-black/60 backdrop-blur-xl border border-white/10",
              "opacity-0 group-hover/scroll:opacity-100 hover:bg-brand-primary hover:border-brand-primary shadow-[0_0_20px_rgba(0,0,0,0.5)]",
              buttonClasses,
              offsetClasses,
              !showLeft && "pointer-events-none !opacity-0"
            )}
            aria-label="Scroll Left"
          >
            <ChevronLeft className={iconSize} />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!showRight}
            className={clsx(
              "absolute right-0 top-[calc(50%+2px)] md:top-[calc(50%-4px)] -translate-y-1/2 translate-x-2 flex items-center justify-center text-white transition-all duration-300 z-10",
              "bg-black/60 backdrop-blur-xl border border-white/10",
              "opacity-0 group-hover/scroll:opacity-100 hover:bg-brand-primary hover:border-brand-primary shadow-[0_0_20px_rgba(0,0,0,0.5)]",
              buttonClasses,
              offsetRightClasses,
              !showRight && "pointer-events-none !opacity-0"
            )}
            aria-label="Scroll Right"
          >
            <ChevronRight className={iconSize} />
          </button>
        </>
      )}
    </div>
  );
};

export default ScrollContainer;
