import { User as UserIcon, Camera, Film, List, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import type { User } from '@/types/auth.types';
import type { ProfileStats } from './profile.types';

interface ProfileHeroProps {
  user: User | null;
  stats: ProfileStats;
}

const ProfileHero = ({ user, stats }: ProfileHeroProps) => {
  return (
    <div className="relative mb-20">
      {/* Banner */}
      <div className="h-48 md:h-64 w-full relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-background to-brand-secondary/20" />
        {/* Placeholder for dynamic banner if available */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        
        <button 
          className="absolute top-4 right-4 p-2 rounded-full bg-background/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-background/60 transition-standard"
          aria-label="Change cover photo"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Info Overlay */}
      <div className="absolute -bottom-16 left-6 md:left-12 flex flex-col md:flex-row items-end gap-6 w-[calc(100%-3rem)] md:w-[calc(100%-6rem)]">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-card border-4 border-background overflow-hidden shadow-2xl transition-standard group-hover:scale-[1.02]">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-primary/10">
                <UserIcon className="w-16 h-16 text-brand-primary" />
              </div>
            )}
          </div>
          <button 
            className="absolute bottom-2 right-2 p-2 rounded-xl bg-brand-primary text-white shadow-lg hover:scale-110 transition-standard"
            aria-label="Change profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Name and Stats */}
        <div className="flex-1 pb-2 md:pb-4 space-y-4 md:space-y-2">
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white tracking-tight"
            >
              {user?.displayName || 'Anonymous User'}
            </motion.h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              Active Member
            </p>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-8 pt-2">
            <StatItem icon={<Film className="w-4 h-4" />} label="Movies" value={stats.moviesWatched} />
            <StatItem icon={<List className="w-4 h-4" />} label="Lists" value={stats.listsCreated} />
            <StatItem icon={<Star className="w-4 h-4" />} label="Reviews" value={stats.reviewsWritten} />
            <StatItem icon={<Users className="w-4 h-4" />} label="Followers" value={stats.followers} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="flex items-center gap-2.5 group cursor-default">
    <div className="p-1.5 rounded-lg bg-white/5 text-brand-secondary group-hover:bg-brand-secondary/10 group-hover:scale-110 transition-standard">
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold text-white leading-none tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
    </div>
  </div>
);

export default ProfileHero;
