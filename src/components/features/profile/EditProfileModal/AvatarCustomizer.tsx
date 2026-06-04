import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { AVATAR_PRESETS } from './constants';

interface AvatarCustomizerProps {
  photoURL: string;
  showCustomAvatarInput: boolean;
  isSaving: boolean;
  setPhotoURL: (url: string) => void;
  setShowCustomAvatarInput: (show: boolean) => void;
}

export const AvatarCustomizer = ({
  photoURL,
  showCustomAvatarInput,
  isSaving,
  setPhotoURL,
  setShowCustomAvatarInput,
}: AvatarCustomizerProps) => {
  return (
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
            placeholder="Paste direct avatar image URL (https://…)"
            className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-white/5 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard"
          />
        </motion.div>
      )}
    </div>
  );
};

export default AvatarCustomizer;
