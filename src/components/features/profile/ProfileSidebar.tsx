import { Calendar, MapPin, Film, Mail, ExternalLink, Settings, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

import type { User } from '@/types/auth.types';
import Button from '@/components/ui/Button';

interface ProfileSidebarProps {
  user: User | null;
  onLogout: () => void;
}

const ProfileSidebar = ({ user, onLogout }: ProfileSidebarProps) => {
  return (
    <aside className="space-y-6">
      {/* About Section */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">About</h3>
          <button className="text-muted-foreground hover:text-brand-primary transition-standard">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cinephile, coffee enthusiast, and casual critic. I love exploring indie films and psychological thrillers. Always looking for the next masterpiece.
        </p>
        
        <div className="space-y-3 pt-2">
          <DetailItem 
            icon={<Calendar className="w-4 h-4" />} 
            label="Joined" 
            value={user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'N/A'} 
          />
          <DetailItem 
            icon={<MapPin className="w-4 h-4" />} 
            label="Location" 
            value="San Francisco, CA" 
          />
          <DetailItem 
            icon={<Film className="w-4 h-4" />} 
            label="Fav Genre" 
            value="Sci-Fi / Thriller" 
          />
          <DetailItem 
            icon={<Mail className="w-4 h-4" />} 
            label="Email" 
            value={user?.email || 'N/A'} 
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="font-bold">Social</h3>
        <div className="space-y-2">
          <SocialLink label="Letterboxd" href="#" />
          <SocialLink label="Twitter" href="#" />
          <SocialLink label="Personal Blog" href="#" />
        </div>
      </div>

      {/* Account Actions */}
      <div className="flex flex-col gap-3">
        <Button variant="secondary" className="justify-start h-11 border-white/5">
          <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
          Account Settings
        </Button>
        <Button 
          variant="secondary" 
          className="justify-start h-11 border-error/20 hover:bg-error/10 hover:text-error hover:border-error/50"
          onClick={onLogout}
        >
          <ExternalLink className="w-4 h-4 mr-3 rotate-180" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="text-brand-secondary">{icon}</div>
    <span className="text-muted-foreground w-20">{label}</span>
    <span className="text-white font-medium truncate">{value}</span>
  </div>
);

const SocialLink = ({ label, href }: { label: string; href: string }) => (
  <a 
    href={href}
    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-standard group text-sm"
  >
    <span className="text-muted-foreground group-hover:text-white transition-standard">{label}</span>
    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-primary transition-standard" />
  </a>
);

export default ProfileSidebar;
