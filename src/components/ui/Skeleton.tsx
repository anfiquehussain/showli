import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div 
      className={clsx(
        "shimmer-effect rounded-xl border border-white/5",
        className
      )} 
    />
  );
};

export default Skeleton;
