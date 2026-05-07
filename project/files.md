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
│   ├── collections/    # [NEW] Collections service layer
│   │   ├── collectionsService.ts # Firebase firestore for collections
│   │   └── collectionsApi.ts     # RTK Query for collections
│   └── tmdb/           # TMDb specific API endpoints
│       └── tmdbApi.ts  # RTK Query API for trending, search, etc.
├── assets/             # Static assets (images, global icons)
├── components/         # UI Components (3-Layer Architecture)
│   ├── ui/             # [Layer 1] Primitives (Button.tsx, IconButton.tsx, Input.tsx)
│   ├── patterns/       # [Layer 2] Reusable Patterns (Modal, PageHeader, MediaScroll, MediaCard, StatusBadge)
│   └── features/       # [Layer 3] Feature Components (Grouped by domain)
│       ├── auth/       # Authentication (AuthModal.tsx)
│       ├── layout/     # Global structure (MainLayout.tsx, Navbar.tsx)
│       ├── movies/     # Movie-related components (HeroCarousel.tsx, MediaDetails.tsx)
│       ├── tv/         # TV-related components (DiscoveryGrids.tsx)
│       ├── profile/    # Profile-related components (ProfileHero.tsx, ProfileSidebar.tsx)
│       └── collections/# Collection-related components (CollectionList, CollectionModal, etc.)
├── hooks/              # Reusable global hooks
│   ├── useAuth.ts      # Firebase auth logic and state sync
│   ├── useRedux.ts     # Pre-typed useAppDispatch & useAppSelector
│   └── useToast.ts     # Typed toast notification hook
├── lib/                # Third-party library configs
│   └── firebase.ts     # Firebase initialization (typed with FirebaseOptions)
├── pages/              # Routed page components
│   ├── HomePage.tsx      # App landing page
│   ├── ProfilePage.tsx   # User profile and favorites
│   ├── DetailsPage.tsx   # Media (Movie/TV) detail view
│   ├── CollectionsPage.tsx # [NEW] Library dashboard and collections list
│   └── CollectionDetailsPage.tsx # [NEW] Individual collection view
├── routes/             # Route definitions
├── store/              # Redux store configuration
│   ├── index.ts        # Store setup, exports RootState & AppDispatch
│   └── slices/         # Redux Toolkit slices
├── styles/             # Global styles (index.css with theme tokens)
├── types/              # Global TypeScript type definitions
│   ├── env.d.ts        # Vite environment variable types (ImportMetaEnv)
│   ├── tmdb.types.ts   # TMDb API response types
│   ├── auth.types.ts   # Firebase auth types
│   ├── collections.types.ts # Collection and movie types
│   └── index.ts        # Barrel export for all global types
├── utils/              # Helper functions (image.ts, date-fns helpers)
│   └── image.ts        # TMDb image URL construction
├── App.tsx             # App entry with Router
└── main.tsx            # React DOM mounting point
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
-   Grouped by domain (e.g., `features/movies/`).
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
| API Services | `.ts` | camelCase | `base.ts`, `tmdbApi.ts` |
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
