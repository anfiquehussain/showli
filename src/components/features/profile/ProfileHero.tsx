import { User as UserIcon, LogOut, Key, Heart, Layers, MessageSquare, Calendar, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import type { User } from '@/types/auth.types';
import Button from '@/components/ui/Button';

interface ProfileHeroProps {
  user: User | null;
  collectionsCount: number;
  reviewsCount: number;
  favoritesCount: number;
  bannerURL?: string;
  onLogout: () => void;
  onEditProfile: () => void;
}

const ProfileHero = ({
  user,
  collectionsCount,
  reviewsCount,
  favoritesCount,
  bannerURL,
  onLogout,
  onEditProfile,
}: ProfileHeroProps) => {
  const joinedDate = user?.createdAt
    ? format(new Date(user.createdAt), 'MMMM yyyy')
    : 'N/A';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/5 bg-zinc-950 shadow-2xl">
      {/* Dynamic Cinematic Banner Background */}
      <div className="h-28 sm:h-36 md:h-44 w-full relative overflow-hidden group/banner">
        <div className="absolute inset-0 bg-linear-to-br from-brand-primary/20 via-background to-brand-secondary/20 z-0" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-65 transition-all duration-700 z-0" 
          style={{ backgroundImage: `url("${bannerURL || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop'}")` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 to-transparent z-10" />

        {/* Quick Edit Banner Button overlay */}
        <button
          type="button"
          onClick={onEditProfile}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/50 hover:bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-standard opacity-0 group-hover/banner:opacity-100 focus:opacity-100"
        >
          <Camera className="w-3.5 h-3.5" />
          Edit Backdrop
        </button>
      </div>

      {/* User Details & Stats Area */}
      <div className="relative px-6 pb-6 md:px-10 md:pb-8 -mt-10 sm:-mt-12 md:-mt-14 z-20 flex flex-col gap-6">
        {/* Profile Header (Avatar + Name & Info + Action Buttons) */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left justify-between w-full">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group cursor-pointer" onClick={onEditProfile} title="Change Profile Avatar">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-card border-4 border-zinc-950 overflow-hidden shadow-2xl transition-standard group-hover:scale-[1.02] relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-primary/10">
                    <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-brand-primary" />
                  </div>
                )}
                {/* Hover camera edit overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-standard flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

             {/* User Meta Details */}
            <div className="space-y-1.5 md:pb-1">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg sm:text-xl md:text-2xl font-heading font-black text-white tracking-tight leading-none"
              >
                {user?.displayName || 'Anonymous User'}
              </motion.h1>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-1.5 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground">
                <span className="font-semibold text-white/95">{user?.email}</span>
                <span className="hidden sm:inline text-white/10">|</span>
                <div className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-secondary" />
                  Joined {joinedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Forgot Password, Logout) */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:pb-1 w-full md:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5 bg-white/5 hover:bg-white/10 border-white/5 w-full sm:w-auto"
              onClick={() => {}}
            >
              <Key className="w-3 h-3 text-muted-foreground" />
              Forgot Password
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5 border-error/20 hover:bg-error/10 hover:text-error hover:border-error/40 w-full sm:w-auto"
              onClick={onLogout}
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5" />

        {/* Dynamic Activity Stats Row */}
        <div className="flex items-center justify-center md:justify-start gap-8 sm:gap-12 md:gap-16 pt-1">
          <StatItem
            icon={<Heart className="w-4 h-4" />}
            label="Favorites"
            value={`${favoritesCount} / 5`}
            colorClass="text-brand-primary"
          />
          <StatItem
            icon={<Layers className="w-4 h-4" />}
            label="Collections"
            value={collectionsCount}
            colorClass="text-brand-secondary"
          />
          <StatItem
            icon={<MessageSquare className="w-4 h-4" />}
            label="Reviews"
            value={reviewsCount}
            colorClass="text-brand-accent"
          />
        </div>
      </div>
    </div>
  );
};

const StatItem = ({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colorClass: string;
}) => (
  <div className="flex items-center gap-2 group cursor-default">
    <div className={`p-1.5 rounded-lg bg-white/5 ${colorClass} group-hover:bg-white/10 group-hover:scale-105 transition-standard`}>
      {icon}
    </div>
    <div>
      <p className="text-base font-heading font-black text-white leading-none tabular-nums">
        {value}
      </p>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">
        {label}
      </p>
    </div>
  </div>
);

export default ProfileHero;
