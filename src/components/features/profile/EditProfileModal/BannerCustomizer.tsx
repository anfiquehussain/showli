import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { BANNER_PRESETS, DEFAULT_BANNER } from './constants';

interface BannerCustomizerProps {
  bannerURL: string;
  showCustomBannerInput: boolean;
  isSaving: boolean;
  setBannerURL: (url: string) => void;
  setShowCustomBannerInput: (show: boolean) => void;
}

export const BannerCustomizer = ({
  bannerURL,
  showCustomBannerInput,
  isSaving,
  setBannerURL,
  setShowCustomBannerInput,
}: BannerCustomizerProps) => {
  return (
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
            placeholder="Paste direct banner image URL (https://…)"
            className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-white/5 text-xs text-white focus:outline-hidden focus:border-brand-primary/50 focus:bg-brand-primary/5 transition-standard"
          />
        </motion.div>
      )}
    </div>
  );
};

export default BannerCustomizer;
