import { useState } from 'react';
import HeroCarousel from '@/components/features/media/HeroCarousel';
import HomeToggle from '@/components/features/media/HomeToggle';
import HomeFeatured from '@/components/features/media/HomeFeatured';
import HomeDiscovery from '@/components/features/media/HomeDiscovery';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'featured' | 'discovery'>('featured');

  return (
    <div className="space-y-4 md:space-y-8 pb-20">
      {/* Hero Carousel - Global */}
      <HeroCarousel />

      {/* Session Navigation */}
      <HomeToggle activeTab={activeTab} onChange={setActiveTab} />

      {/* Conditional Content Session */}
      <main className="container mx-auto px-0">
        {activeTab === 'featured' ? (
          <HomeFeatured />
        ) : (
          <HomeDiscovery />
        )}
      </main>
    </div>
  );
};

export default HomePage;
