import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Ghost, 
  Heart, 
  Rocket, 
  Globe, 
  Languages, 
  Calendar, 
  Compass,
  Smile,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 'action', name: 'Action', icon: Zap, color: 'bg-orange-500/10 text-orange-500', genreId: 28 },
  { id: 'comedy', name: 'Comedy', icon: Smile, color: 'bg-yellow-500/10 text-yellow-500', genreId: 35 },
  { id: 'horror', name: 'Horror', icon: Ghost, color: 'bg-purple-500/10 text-purple-500', genreId: 27 },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'bg-pink-500/10 text-pink-500', genreId: 10749 },
  { id: 'scifi', name: 'Sci-Fi', icon: Rocket, color: 'bg-blue-500/10 text-blue-500', genreId: 878 },
  { id: 'crime', name: 'Crime', icon: Shield, color: 'bg-red-500/10 text-red-500', genreId: 80 },
];

const METADATA_LINKS = [
  { id: 'countries', name: 'Countries', icon: Globe, path: '/browse?focus=countries' },
  { id: 'languages', name: 'Languages', icon: Languages, path: '/browse?focus=languages' },
  { id: 'upcoming', name: '2024 Releases', icon: Calendar, path: '/browse?year=2024' },
  { id: 'explore', name: 'Explore All', icon: Compass, path: '/browse' },
];

const QuickBrowseHub = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6 py-8">
      <div className="flex flex-col">
        <h2 className="text-base md:text-lg font-bold text-foreground uppercase tracking-wider">Explore Collections</h2>
        <p className="text-xs text-muted-foreground">Find movies and shows by genre or origin.</p>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/browse?genre=${cat.genreId}`)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors ${cat.color}`}
          >
            <cat.icon className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold uppercase tracking-wide">{cat.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Secondary Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METADATA_LINKS.map((link) => (
          <motion.button
            key={link.id}
            whileHover={{ x: 4 }}
            onClick={() => navigate(link.path)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
              <link.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">{link.name}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default QuickBrowseHub;
