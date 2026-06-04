import { User } from 'lucide-react';
import { DEFAULT_BANNER } from './constants';

interface ProfilePreviewProps {
  displayName: string;
  location: string;
  photoURL: string;
  bannerURL: string;
}

export const ProfilePreview = ({
  displayName,
  location,
  photoURL,
  bannerURL,
}: ProfilePreviewProps) => {
  return (
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
  );
};

export default ProfilePreview;
