import { useParams } from 'react-router-dom';
import { useGetPersonDetailsQuery, useGetPersonCombinedCreditsQuery, useGetPersonTaggedImagesQuery, useGetPersonExternalIdsQuery, useGetPersonImagesQuery } from '@/api/media/mediaApi';
import PersonHero from './PersonHero';
import PersonCredits from './PersonCredits';
import PersonGallery from './PersonGallery';
import PersonQuickFacts from './PersonQuickFacts';

const PersonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);

  const { data: person, isLoading: isPersonLoading } = useGetPersonDetailsQuery(personId);
  const { data: credits, isLoading: isCreditsLoading } = useGetPersonCombinedCreditsQuery(personId);
  const { data: taggedImages, isLoading: isTaggedImagesLoading } = useGetPersonTaggedImagesQuery({ id: personId });
  const { data: profileImages, isLoading: isProfileImagesLoading } = useGetPersonImagesQuery(personId);
  const { data: externalIds } = useGetPersonExternalIdsQuery(personId);

  if (isPersonLoading || isCreditsLoading || isTaggedImagesLoading || isProfileImagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/50">
        Person not found
      </div>
    );
  }

  // Find the latest credit with a backdrop
  const latestCredit = credits 
    ? [...credits.cast, ...credits.crew]
        .filter(c => c.backdrop_path)
        .sort((a, b) => {
          const dateA = new Date('release_date' in a ? a.release_date : a.first_air_date || '').getTime() || 0;
          const dateB = new Date('release_date' in b ? b.release_date : b.first_air_date || '').getTime() || 0;
          return dateB - dateA;
        })[0]
    : undefined;

  // Banner logic:
  // 1. First Priority: Tagged images (most likely to feature the person)
  // 2. Fallback: Latest project backdrop
  const taggedBanner = taggedImages?.results
    ?.filter(img => (img.aspect_ratio || 0) > 1.2) // Prefer landscape images
    ?.sort((a, b) => {
      const dateA = new Date('release_date' in a.media ? a.media.release_date : a.media.first_air_date || '').getTime() || 0;
      const dateB = new Date('release_date' in b.media ? b.media.release_date : b.media.first_air_date || '').getTime() || 0;
      return dateB - dateA;
    })[0]?.file_path;

  const bannerPath = taggedBanner || latestCredit?.backdrop_path;

  return (
    <div className="min-h-screen bg-background">
      <PersonHero person={person} bannerPath={bannerPath} />
      
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
          {/* Main Content (Left, Wider) */}
          <main className="lg:col-span-8 space-y-12">
            {/* Biography Section */}
            {person.biography && (
              <section className="space-y-4">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  Biography
                </h2>
                <div className="text-white/70 whitespace-pre-line text-sm md:text-base leading-relaxed max-w-4xl">
                  {person.biography}
                </div>
              </section>
            )}

            {/* Unified Gallery Section */}
            <PersonGallery 
              personId={personId}
              profileImages={profileImages?.profiles} 
            />
            
            {/* Credits Section */}
            {credits && <PersonCredits credits={credits} personName={person.name} />}
          </main>

          {/* Sidebar / Quick Facts (Right, Narrower) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <PersonQuickFacts person={person} externalIds={externalIds} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;
