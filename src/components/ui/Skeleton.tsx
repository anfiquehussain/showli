import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div 
      className={clsx(
        "animate-pulse bg-white/5 rounded-xl border border-white/5",
        className
      )} 
    />
  );
};

export default Skeleton;
