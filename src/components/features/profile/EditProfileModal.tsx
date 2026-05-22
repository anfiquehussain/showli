import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Film, AlignLeft, Sparkles, Camera, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDisplayName: string | null | undefined;
  currentBio: string | undefined;
  currentLocation: string | undefined;
  currentFavoriteGenre: string | undefined;
  currentPhotoURL: string | null | undefined;
  currentBannerURL: string | undefined;
  onSave: (details: {
    displayName: string;
    bio: string;
    location: string;
    favoriteGenre: string;
    photoURL: string;
    bannerURL: string;
  }) => Promise<void>;
}

const DEFAULT_GENRE = 'Sci-Fi & Thriller';
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

const AVATAR_PRESETS = [
  { id: 'camera', name: 'Director Camera', url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=200&auto=format&fit=crop' },
  { id: 'popcorn', name: 'Popcorn Cinephile', url: 'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?q=80&w=200&auto=format&fit=crop' },
  { id: 'detective', name: 'Noir Detective', url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=200&auto=format&fit=crop' },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop' }
];

const BANNER_PRESETS = [
  { id: 'theatre', name: 'Classic Theatre', url: DEFAULT_BANNER },
  { id: 'filmroll', name: 'Retro Film Roll', url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?q=80&w=2070&auto=format&fit=crop' },
  { id: 'neon', name: 'Neon Cinema', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop' },
  { id: 'scifi', name: 'Cosmic Sci-Fi', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2070&auto=format&fit=crop' }
];

const GENRES = [
  DEFAULT_GENRE,
  'Action & Adventure',
  'Drama',
  'Comedy',
  'Horror',
  'Mystery & Suspense',
  'Romance',
  'Fantasy',
  'Indie & Art-House',
  'Documentary',
  'Animation',
];

const EditProfileModal = ({
  isOpen,
  onClose,
  currentDisplayName,
  currentBio,
  currentLocation,
  currentFavoriteGenre,
  currentPhotoURL,
  currentBannerURL,
  onSave,
}: EditProfileModalProps) => {
  const [displayName, setDisplayName] = useState<string>(currentDisplayName ?? '');
  const [bio, setBio] = useState<string>(currentBio ?? '');
  const [location, setLocation] = useState<string>(currentLocation ?? '');
  const [favoriteGenre, setFavoriteGenre] = useState<string>(currentFavoriteGenre ?? DEFAULT_GENRE);
  const [photoURL, setPhotoURL] = useState<string>(currentPhotoURL ?? '');
  const [bannerURL, setBannerURL] = useState<string>(currentBannerURL ?? DEFAULT_BANNER);

  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [showCustomBannerInput, setShowCustomBannerInput] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state values when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentDisplayName ?? '');
      setBio(currentBio ?? '');
      setLocation(currentLocation ?? '');
      setFavoriteGenre(currentFavoriteGenre ?? DEFAULT_GENRE);
      setPhotoURL(currentPhotoURL ?? '');
      setBannerURL(currentBannerURL ?? DEFAULT_BANNER);
      
      const isCustomAvatar = !!currentPhotoURL && !AVATAR_PRESETS.some(p => p.url === currentPhotoURL);
      const isCustomBanner = !!currentBannerURL && currentBannerURL !== DEFAULT_BANNER && !BANNER_PRESETS.some(p => p.url === currentBannerURL);
      setShowCustomAvatarInput(isCustomAvatar);
      setShowCustomBannerInput(isCustomBanner);
      
      setError(null);
    }
  }, [isOpen, currentDisplayName, currentBio, currentLocation, currentFavoriteGenre, currentPhotoURL, currentBannerURL]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        favoriteGenre,
        photoURL: photoURL.trim(),
        bannerURL: bannerURL.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl rounded-2xl border border-white/5 bg-zinc-950/95 shadow-2xl overflow-hidden glass-card z-10 max-h-[90vh] flex flex-col"
          >
            {/* Ambient visual glowing accents */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-secondary/10 text-brand-secondary">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-black text-white uppercase tracking-wider">
                  Edit Profile & Customizer
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-standard disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields (Scrollable Container) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg border border-error/20 bg-error/10 text-error text-xs font-bold leading-normal">
                  {error}
                </div>
              )}

              {/* Dynamic Preview Section */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/50 p-4 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Profile Customizer Preview</p>
                <div className="relative w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/5">
                  {/* Banner */}
                  <div className="h-20 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-brand-primary/20 via-background to-brand-secondary/20 z-0" />
                    <img 
                      src={bannerURL || DEFAULT_BANNER} 
                      alt="Banner Preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_BANNER;
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-950 to-transparent z-10" />
                  </div>
                  {/* Profile & Info */}
                  <div className="relative px-4 pb-4 -mt-6 z-20 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-card border-2 border-zinc-950 overflow-hidden shadow-xl shrink-0">
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-primary/10">
                          <User className="w-5 h-5 text-brand-primary" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{displayName || 'Anonymous User'}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{location || 'No Location Set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter your name"
                    maxLength={40}
                    className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-white/5 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g. Los Angeles, CA"
                    maxLength={40}
                    className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-white/5 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard"
                  />
                </div>
              </div>

              {/* Favorite Genre */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Film className="w-3.5 h-3.5" />
                  Favorite Genre
                </label>
                <select
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value)}
                  disabled={isSaving}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-zinc-950 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard cursor-pointer"
                >
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre} className="bg-zinc-950 text-white">
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interactive Avatar Customizer */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Camera className="w-3.5 h-3.5" />
                  Choose Profile Avatar
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setPhotoURL(preset.url);
                        setShowCustomAvatarInput(false);
                      }}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 bg-zinc-900 transition-standard hover:scale-105 ${
                        !showCustomAvatarInput && photoURL === preset.url
                          ? 'border-brand-primary ring-2 ring-brand-primary/20'
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setShowCustomAvatarInput(true);
                      if (AVATAR_PRESETS.some(p => p.url === photoURL)) {
                        setPhotoURL('');
                      }
                    }}
                    className={`h-12 px-3.5 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wider transition-standard ${
                      showCustomAvatarInput
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-white/5 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>

                {showCustomAvatarInput && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <input
                      type="url"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      disabled={isSaving}
                      placeholder="Paste direct avatar image URL (https://...)"
                      className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-white/5 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard"
                    />
                  </motion.div>
                )}
              </div>

              {/* Interactive Banner Customizer */}
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Choose Banner Background
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BANNER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setBannerURL(preset.url);
                        setShowCustomBannerInput(false);
                      }}
                      className={`relative aspect-video rounded-xl overflow-hidden border-2 bg-zinc-900 transition-standard hover:scale-[1.02] flex flex-col justify-end text-left group ${
                        !showCustomBannerInput && bannerURL === preset.url
                          ? 'border-brand-secondary ring-2 ring-brand-secondary/20'
                          : 'border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-standard" />
                      <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 to-transparent z-10" />
                      <span className="relative z-20 p-2 text-[8px] font-bold uppercase tracking-wider text-white line-clamp-1 truncate w-full">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setShowCustomBannerInput(true);
                      if (BANNER_PRESETS.some(p => p.url === bannerURL) || bannerURL === DEFAULT_BANNER) {
                        setBannerURL('');
                      }
                    }}
                    className={`h-9 px-3.5 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wider transition-standard ${
                      showCustomBannerInput
                        ? 'border-brand-secondary bg-brand-secondary/5 text-brand-secondary'
                        : 'border-white/5 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>

                {showCustomBannerInput && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <input
                      type="url"
                      value={bannerURL}
                      onChange={(e) => setBannerURL(e.target.value)}
                      disabled={isSaving}
                      placeholder="Paste direct banner image URL (https://...)"
                      className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-white/5 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard"
                    />
                  </motion.div>
                )}
              </div>

              {/* Bio Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <AlignLeft className="w-3.5 h-3.5" />
                    Short Bio
                  </label>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      bio.length > 180 ? 'text-error' : 'text-muted-foreground'
                    }`}
                  >
                    {bio.length} / 200
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isSaving}
                  placeholder="Tell us about yourself..."
                  maxLength={200}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-white/5 bg-white/5 text-xs text-white placeholder-muted-foreground focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard resize-none"
                />
              </div>
            </form>

            {/* Action Buttons (Fixed Footer) */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5 relative z-10 shrink-0 bg-zinc-950 animate-in fade-in duration-300">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
                className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={isSaving}
                className="h-9 px-5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md bg-linear-to-r from-brand-primary to-brand-secondary text-white border-0"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
