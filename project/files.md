# Project Structure & Scalability

This document explains the organization of the codebase and the rationale behind the directory structure, following the strict 3-layer UI architecture with full TypeScript.

## Directory Overview

```text
src/
├── api/                # API service layer (typed constants, RTK Query APIs)
│   ├── base.ts         # TMDb API base URL & key constants
│   ├── auth/           # Auth service layer
│   │   └── authService.ts # Firebase auth implementation
│   ├── profile/        # Profile service layer
│   │   └── profileService.ts # Firebase firestore implementation for favorites
│   ├── collections/    # Collections service layer
│   │   ├── collectionsService.ts # Firebase firestore for collections
│   │   └── collectionsApi.ts     # RTK Query for collections
│   ├── discussions/    # Discussion service layer
│   │   └── discussionsService.ts # Firebase firestore for comments/reviews
│   ├── scheduling/     # Scheduling service layer
│   │   └── schedulingService.ts # Firebase firestore for movie/TV schedules
│   └── media/           # TMDb specific API endpoints
│       ├── mediaApi.ts  # RTK Query API for trending, search, etc.
│       └── mediaDiscovery.ts # Discovery row presets
├── assets/             # Static assets (images, global icons)
├── components/         # UI Components (3-Layer Architecture)
│   ├── ui/             # [Layer 1] Primitives (Button.tsx, IconButton.tsx, Input.tsx, Logo.tsx, Rating.tsx, Skeleton.tsx)
│   ├── patterns/       # [Layer 2] Reusable Patterns (Modal, ConfirmationModal, PageHeader, MediaScroll, MediaCard, PersonScroll, PersonCard, PaginationControls, StatusBadge, SearchBar, ProtectedRoute, ScrollContainer, ScrollToTop, BackToTopButton)
│   └── features/       # [Layer 3] Feature Components (Grouped by domain)
│       ├── auth/       # Authentication
│       │   └── AuthModal/ # Decomposed authentication modal dialog
│       │       ├── index.tsx
│       │       ├── LoginForm.tsx
│       │       ├── RegisterForm.tsx
│       │       └── GoogleButton.tsx
│       ├── layout/     # Global structure (MainLayout.tsx)
│       │   └── Navbar/  # Decomposed global navigation header
│       │       ├── index.tsx
│       │       ├── DesktopNavbar.tsx
│       │       ├── MobileNavbar.tsx
│       │       ├── GithubIcon.tsx
│       │       └── types.ts
│       ├── media/      # Media-related components
│       │   ├── MediaDetails/ # Decomposed details component
│       │   │   ├── index.tsx
│       │   │   ├── MediaHero.tsx
│       │   │   ├── MediaQuickFacts.tsx
│       │   │   ├── MediaReviewsSection/ # Unified reviews & discussion
│       │   │   │   ├── index.tsx
│       │   │   │   ├── ShowliDiscussion.tsx
│       │   │   │   ├── TmdbReviews.tsx
│       │   │   │   ├── CommentItem.tsx
│       │   │   │   ├── CommentForm.tsx
│       │   │   │   └── RatingPicker.tsx
│       │   │   ├── MediaCast.tsx
│       │   │   ├── MediaCrew.tsx
│       │   │   ├── MediaImages.tsx
│       │   │   ├── MediaKeywords.tsx
│       │   │   ├── MediaVideos.tsx
│       │   │   ├── MediaWatchProviders.tsx
│       │   │   ├── MediaRecommendations.tsx
│       │   │   ├── MediaSimilar.tsx
│       │   │   ├── TVSeasons.tsx
│       │   │   ├── EpisodeCard.tsx
│       │   │   ├── EpisodeRatingsModal.tsx
│       │   │   └── FullCreditsModal.tsx
│       │   ├── EpisodeDetails/ # Decomposed episode details component
│       │   │   ├── index.tsx
│       │   │   ├── EpisodeHero.tsx
│       │   │   ├── EpisodeInfo.tsx
│       │   │   ├── EpisodeCredits.tsx
│       │   │   ├── EpisodeGallery.tsx
│       │   │   └── EpisodeNavigation.tsx
│       │   ├── Browse/ # Advanced search & filters
│       │   │   ├── index.tsx
│       │   │   ├── BrowseToolbar.tsx
│       │   │   ├── BrowseFilters.tsx
│       │   │   ├── BrowseResults.tsx
│       │   │   └── FilterChips.tsx
│       │   ├── HeroCarousel.tsx
│       │   ├── HomeToggle.tsx
│       │   ├── QuickBrowseHub/ # Decomposed quick browse section
│       │   │   ├── index.tsx
│       │   │   ├── constants.ts
│       │   │   ├── DynamicCard.tsx
│       │   │   ├── ProviderCard.tsx
│       │   │   ├── StudioCard.tsx
│       │   │   ├── CountryCard.tsx
│       │   │   ├── TimePeriodCard.tsx
│       │   │   └── LanguageCard.tsx
│       │   ├── HomeFeatured/ # Decomposed trending & landing categories
│       │   │   ├── index.tsx
│       │   │   └── HomeSearchBar.tsx
│       │   ├── HomeDiscovery.tsx
│       │   ├── DiscoveryIcons.tsx
│       │   └── PersonDetails/ # Decomposed person profile
│       │       ├── index.tsx
│       │       ├── PersonHero.tsx
│       │       ├── PersonQuickFacts.tsx
│       │       ├── PersonCredits.tsx
│       │       ├── PersonGallery.tsx
│       │       └── PersonAllCreditsModal.tsx
│       ├── profile/    # Profile-related components
│       │   ├── ProfileHero.tsx
│       │   ├── ProfileSection.tsx
│       │   ├── ProfileFavorites.tsx
│       │   ├── AddFavoriteModal.tsx
│       │   ├── EditProfileModal/ # Decomposed edit profile modal
│       │   │   ├── index.tsx
│       │   │   ├── ProfilePreview.tsx
│       │   │   ├── AvatarCustomizer.tsx
│       │   │   ├── BannerCustomizer.tsx
│       │   │   └── constants.ts
│       │   ├── AllReviewsModal.tsx
│       │   ├── ProfileReviewCard.tsx
│       │   ├── profile.types.ts
│       │   └── hooks/      # Feature-specific hooks
│       │       └── useProfilePage.ts
│       └── collections/# Collection-related components
│           ├── AddToCollectionProvider.tsx
│           ├── CollectionDetails/ # Decomposed
│           │   ├── index.tsx
│           │   ├── CollectionDetailsHeader.tsx
│           │   ├── CollectionDetailsToolbar.tsx
│           │   ├── CollectionMediaCard.tsx
│           │   └── RandomPickModal.tsx
│           ├── CollectionList/ # Decomposed
│           │   ├── index.tsx
│           │   └── CollectionListItem.tsx
│           ├── AddToCollectionModal/ # Decomposed
│           │   ├── index.tsx
│           │   └── CollectionItem.tsx
│           ├── hooks/      # Feature-specific hooks
│           │   ├── useCollectionsManagement.ts
│           │   └── useCollectionDetails.ts
│           ├── CollectionsHero.tsx
│           ├── CollectionModal.tsx
│           ├── AddMediaModal.tsx
│           └── ExportModal/ # Folder-per-component for exporting collections
│               └── index.tsx
│       ├── scheduling/ # Watch planner & scheduling components
│       │   ├── ScheduleCalendar/ # Calendar UI layout
│       │   │   ├── index.tsx
│       │   │   ├── CalendarDay.tsx
│       │   │   └── ScheduleCard.tsx
│       │   ├── ScheduleModal/ # Date & time selector with conflict warnings
│       │   │   ├── index.tsx
│       │   │   ├── DateTimePicker.tsx
│       │   │   └── ConflictWarning.tsx
│       │   ├── TVSchedulePlanner/ # TV binge batch planners
│       │   │   ├── index.tsx
│       │   │   ├── PlanModeSelector.tsx
│       │   │   └── PlanPreview.tsx
│       │   └── hooks/      # Feature-specific custom hooks
│       │       ├── useScheduling.ts
│       │       └── useConflictCheck.ts
├── hooks/              # Reusable global hooks
│   ├── useAuth.ts      # Firebase auth logic and state sync
│   ├── useRedux.ts     # Pre-typed useAppDispatch & useAppSelector
│   ├── useToast.ts     # Typed toast notification hook
│   ├── useIntersectionObserver.ts # Intersection observer for lazy loading
│   ├── useAddToCollection.ts # Global hook to add media to collections
│   └── useInstallPrompt.ts # Hook for PWA installation state and events
├── lib/                # Third-party library configs
│   └── firebase.ts     # Firebase initialization (typed with FirebaseOptions)
├── pages/              # Routed page components
│   ├── HomePage.tsx      # App landing page
│   ├── BrowsePage.tsx    # Advanced search and filters
│   ├── ProfilePage.tsx   # User profile and favorites
│   ├── MediaDetailsPage.tsx   # Media (Movie/TV) detail view
│   ├── EpisodeDetailsPage.tsx # Episode detail view
│   ├── CollectionsPage.tsx # Library dashboard and collections list
│   ├── CollectionDetailsPage.tsx # Individual collection view
│   ├── SchedulePage.tsx    # Watch planner calendar page
│   └── PersonPage.tsx      # Person biography and credits

├── store/              # Redux store configuration
│   ├── index.ts        # Store setup, exports RootState & AppDispatch
│   └── slices/         # Redux Toolkit slices
│       ├── authSlice.ts
│       └── profileSlice.ts
├── styles/             # Global styles (index.css with theme tokens)
├── types/              # Global TypeScript type definitions
│   ├── env.d.ts        # Vite environment variable types (ImportMetaEnv)
│   ├── tmdb.types.ts   # TMDb API response types
│   ├── auth.types.ts   # Firebase auth types
│   ├── collections.types.ts # Collection and media types
│   ├── discussions.types.ts # Discussion and review types
│   ├── scheduling.types.ts # Schedule and plan configuration types
│   └── index.ts        # Barrel export for all global types
├── utils/              # Helper functions (image.ts, date-fns helpers)
│   └── image.ts        # TMDb image URL construction
├── App.tsx             # App entry with Router
└── main.tsx            # React DOM mounting point

public/
├── icons/              # PWA icon assets (generated from icon_without_bg(v).png)
│   ├── icon-192x192.png           # Regular 192px icon
│   ├── icon-512x512.png           # Regular 512px icon
│   ├── icon-maskable-192x192.png  # Maskable 192px icon (dark bg, safe-zone padded)
│   └── icon-maskable-512x512.png  # Maskable 512px icon (dark bg, safe-zone padded)
├── icon_without_bg(v).png         # Source icon (favicon)
├── icon_with_bg(b).png            # Icon with black background
├── icon_with_bg(w).png            # Icon with white background
├── icon_without_bg.png            # Icon without background
├── name_with_bg(w).png            # Logo name with white background
├── name_without_bg(tb).png        # Logo name transparent (dark text)
└── name_without_bg(tw).png        # Logo name transparent (white text)

scripts/
└── generate-pwa-icons.mjs  # Utility to regenerate PWA icons from source
```

## 1. UI Layering (Strict)

### `components/ui/`
-   Atomic, dumb components.
-   No business logic.
-   Reusable across any project.
-   Props typed via `[Component]Props` interfaces extending HTML attributes.

### `components/patterns/`
-   Compositions of `ui` primitives.
-   Domain-agnostic (no "Movie" or "User" terminology).
-   Solves UI problems like "Pagination UI" or "Entity Grid".

### `components/features/`
-   Business-logic heavy.
-   Grouped by domain (e.g., `features/media/`).
-   Contains its own `components/`, `hooks/`, `utils/`, and `types.ts` if they are private to that feature.

---

## 2. Global Folders

### `hooks/`
-   Logic shared across multiple features.
-   Handles stateful logic that doesn't belong to a specific UI component.
-   **`useRedux.ts`**: Pre-typed `useAppDispatch` & `useAppSelector`. Always use these over raw `useDispatch`/`useSelector`.
-   **`useToast.ts`**: Typed wrapper around Sonner for consistent toast notifications.

### `lib/`
-   Initialization of external services (Firebase, Supabase, etc.).
-   Exports typed, configured instances.

### `types/`
-   **Global shared types** used across 2+ features or modules.
-   **`env.d.ts`**: Declares `ImportMetaEnv` for type-safe `import.meta.env` access.
-   **`[domain].types.ts`**: Domain-specific type files (e.g., `tmdb.types.ts`, `auth.types.ts`).
-   **`index.ts`**: Barrel export re-exporting all global types.

### `store/`
-   **`index.ts`**: `configureStore` setup, exports `RootState` and `AppDispatch` types.
-   **`slices/`**: Redux Toolkit slices. Each slice has a typed `[Slice]State` interface.

### `pages/`
-   Thin wrappers that compose feature components.
-   Handle routing logic and URL parameters.

---

## 3. File Naming Conventions

| File Type | Extension | Casing | Example |
|---|---|---|---|
| React Components | `.tsx` | PascalCase | `Button.tsx`, `Navbar.tsx` |
| Hooks | `.ts` | camelCase | `useToast.ts`, `useRedux.ts` |
| Type Definitions | `.types.ts` | camelCase | `tmdb.types.ts`, `auth.types.ts` |
| Environment Types | `.d.ts` | camelCase | `env.d.ts` |
| Store/Slices | `.ts` | camelCase | `index.ts`, `movieSlice.ts` |
| API Services | `.ts` | camelCase | `base.ts`, `mediaApi.ts` |
| Utilities | `.ts` | camelCase | `formatDate.ts` |
| Styles | `.css` | camelCase | `index.css` |

---

## ❌ Structure "Don'ts"

-   **❌ Reverse Imports**: Never import from `features` into `ui` or `patterns`.
-   **❌ Flat Features**: Don't dump all feature components in one folder. Group by domain.
-   **❌ Page Logic**: Don't put business logic or data fetching in `pages/`. Move it to `features/` or `hooks/`.
-   **❌ Duplicate Primitives**: Don't create `SubmitButton` if a generic `Button` exists in `ui/`.
-   **❌ Untyped Redux**: Never use raw `useDispatch` or `useSelector`. Use `useAppDispatch` / `useAppSelector` from `@/hooks/useRedux`.
-   **❌ `any` Types**: Never use `any`. Use `unknown` and narrow with type guards.
-   **❌ `.js`/`.jsx` Files**: All source files MUST use `.ts`/`.tsx` extensions. No JavaScript files in `src/`.

## 4. Scalability Strategy

1.  **Feature Promotion**: If a feature-specific component/hook/util is needed elsewhere, promote it to `patterns/` or root-level `hooks/`.
2.  **Strict Padding**: The `Layout` component in `features/layout/` handles all page padding. Pages must be clean wrappers.
3.  **Type Promotion**: If a feature-specific type is needed by 2+ features, move it to `src/types/[domain].types.ts` and re-export from `src/types/index.ts`.
4.  **Documentation Sync**: Any change to the file structure, new API services, or new features MUST be reflected in the "Directory Overview" of this file immediately.
