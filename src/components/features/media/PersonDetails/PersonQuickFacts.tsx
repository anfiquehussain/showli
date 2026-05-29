import { Globe, Info } from 'lucide-react';
import type { TmdbPersonDetails, TmdbPersonExternalIds } from '@/types/tmdb.types';

// Custom SVG Brand Icons since they are not included in this version of lucide-react
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

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
    { 
      icon: <InstagramIcon className="w-4 h-4" />, 
      url: externalIds?.instagram_id ? `https://instagram.com/${externalIds.instagram_id}` : null,
      hoverClass: "hover:border-brand-accent/50 hover:text-brand-accent text-white"
    },
    { 
      icon: <TwitterIcon className="w-4 h-4" />, 
      url: externalIds?.twitter_id ? `https://twitter.com/${externalIds.twitter_id}` : null,
      hoverClass: "hover:border-brand-secondary/50 hover:text-brand-secondary text-white"
    },
    { 
      icon: <FacebookIcon className="w-4 h-4" />, 
      url: externalIds?.facebook_id ? `https://facebook.com/${externalIds.facebook_id}` : null,
      hoverClass: "hover:border-brand-primary/50 hover:text-brand-primary text-white"
    },
    { 
      icon: <Globe className="w-4 h-4" />, 
      url: person.homepage,
      hoverClass: "hover:border-brand-secondary/50 hover:text-brand-secondary text-white"
    },
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
              className={`p-2.5 rounded-xl bg-white/5 border border-white/10 transition-all group ${link.hoverClass}`}
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
        
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0 lg:space-y-4">
          {facts.filter(f => f.value).map((fact, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{fact.label}</p>
              <p className="text-sm text-white/90 font-medium">{fact.value}</p>
            </div>
          ))}

          {/* Also Known As */}
          {person.also_known_as && person.also_known_as.length > 0 && (
            <div className="space-y-2 col-span-2 lg:col-span-1">
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
