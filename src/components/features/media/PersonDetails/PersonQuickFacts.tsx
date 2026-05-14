import { Globe, ExternalLink, Info, Link2 } from 'lucide-react';
import type { TmdbPersonDetails, TmdbPersonExternalIds } from '@/types/tmdb.types';

interface PersonQuickFactsProps {
  person: TmdbPersonDetails;
  externalIds?: TmdbPersonExternalIds;
}

const PersonQuickFacts = ({ person, externalIds }: PersonQuickFactsProps) => {
  const getGender = (id: number) => {
    switch (id) {
      case 1: return 'Female';
      case 2: return 'Male';
      case 3: return 'Non-binary';
      default: return 'Not specified';
    }
  };

  const facts = [
    { label: 'Known For', value: person.known_for_department },
    { label: 'Gender', value: getGender(person.gender) },
    { label: 'Birthday', value: person.birthday ? new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null },
    { label: 'Place of Birth', value: person.place_of_birth },
    { label: 'Popularity', value: person.popularity.toFixed(1) },
  ];

  const socialLinks = [
    { icon: <ExternalLink className="w-4 h-4" />, url: externalIds?.instagram_id ? `https://instagram.com/${externalIds.instagram_id}` : null },
    { icon: <Link2 className="w-4 h-4" />, url: externalIds?.twitter_id ? `https://twitter.com/${externalIds.twitter_id}` : null },
    { icon: <ExternalLink className="w-4 h-4" />, url: externalIds?.facebook_id ? `https://facebook.com/${externalIds.facebook_id}` : null },
    { icon: <Globe className="w-4 h-4" />, url: person.homepage },
  ].filter(link => link.url);

  return (
    <div className="space-y-8">
      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-primary/50 transition-all text-white group"
            >
              <div className="group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
            </a>
          ))}
          {person.imdb_id && (
            <a
              href={`https://www.imdb.com/name/${person.imdb_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-warning/50 transition-all text-[10px] font-black uppercase tracking-widest text-warning"
            >
              IMDb
            </a>
          )}
        </div>
      )}

      {/* Facts List */}
      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-primary" />
          Personal Info
        </h3>
        
        <div className="space-y-4">
          {facts.filter(f => f.value).map((fact, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{fact.label}</p>
              <p className="text-sm text-white/90 font-medium">{fact.value}</p>
            </div>
          ))}

          {/* Also Known As */}
          {person.also_known_as && person.also_known_as.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Also Known As</p>
              <div className="flex flex-wrap gap-2">
                {person.also_known_as.slice(0, 5).map((name, i) => (
                  <span key={i} className="text-[10px] font-medium text-white/60 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonQuickFacts;
