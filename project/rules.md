# Project Rules & Best Practices

This document outlines the coding standards and architectural principles for the **Movie Planner** project.

## 1. Core Architecture (Strict 3-Layer UI)

All UI code MUST belong to exactly one of the following layers:

-   **ui**: Primitives (dumb, reusable, lowest-level).
-   **patterns**: Reusable UI patterns (compositions of primitives, domain-agnostic).
-   **features**: Business-specific components (own application behavior, business logic).

### 1.1 Strict Import Direction

Imports **MUST** flow in one direction only:
`ui` → `patterns` → `features` → `pages`

**Forbidden Reverse Imports:**
-   `ui` components MUST NOT import from `patterns`, `features`, or `pages`.
-   `patterns` components MUST NOT import from `features` or `pages`.
-   `features` components MUST NOT import from `pages`.

---

## 2. Layer Definitions

### 2.1 `components/ui/` — Primitives
-   **Purpose**: Lowest-level building blocks.
-   **Characteristics**: Dumb components, no business logic, no side effects, no API calls.
-   **Allowed**: Styling, Layout, Accessibility, Visual state (hover, focus, disabled).
-   **❌ Strictly Forbidden Imports**: `api_calls/`, `features/`, `pages/`, Domain models (Category, Movie, User, etc.), Application-specific constants.
-   **Naming**: Generic and responsibility-based (e.g., `Button`, `IconButton`, `Badge`, `Loader`, `Input`).

### 2.2 `components/patterns/` — Reusable UI Patterns
-   **Purpose**: Reusable compositions of primitives, still domain-agnostic.
-   **Characteristics**: Compose primitives, no business rules, no entity-specific naming, no API awareness.
-   **Examples**: `DataTable`, `PaginationControls`, `SelectableList`, `EntityCard`, `MediaCard`, `StatCard`.
-   **Pagination Rule**: Pagination UI belongs here; logic (fetching, response shapes) does NOT.
-   **Confirmation Pattern**: Use `ConfirmationModal` for destructive actions. NEVER use `window.confirm`.
-   **Modal Pattern**: Use `Modal` for complex interactions (Auth, Forms) with Framer Motion animations.
-   **ProtectedRoute Pattern**: Use `ProtectedRoute` to wrap routes requiring authentication.
-   **PageHeader Pattern**: Every page MUST use `PageHeader` for consistent titling and actions.
-   **Dashboard Pattern**: For primary overview pages (e.g., Collections), use a full-width hero with statistics and decorative glass-morphism backgrounds.
-   **StepIndicator Pattern**: Use `StepIndicator` for multi-step processes.

### 2.3 `components/features/` — Feature Components
-   **Purpose**: Business-domain components, own real application behavior.
-   **Characteristics**: May contain business logic, may call APIs, may reference domain entities.
-   **Organization**: Grouped by feature/domain (e.g., `features/movies/`, `features/planner/`, `features/layout/`).
-   **Responsibility**: Configure patterns (columns, actions, permissions), do NOT re-implement UI mechanics.

---

## 3. Feature Internal Organization

Each feature domain (e.g., `movies/`, `planner/`) can contain:
-   **`components/`**: Feature-specific sub-components (NOT reusable across other features).
-   **`hooks/`**: Feature-specific custom hooks (e.g., `useMovieSync`).
-   **`utils/`**: Feature-specific utilities (validation, transformers).
-   **`types.ts`**: Feature-specific TypeScript types.
-   **Naming Pattern**: Use `[Entity]SettingsUpdate` for partial update components.

**Rules**:
-   ✅ Feature hooks can use feature utils.
-   ❌ Feature `components/` MUST NOT be imported by other features.
-   ❌ If a component/hook/util is needed by multiple features, promote it to `patterns/` or `hooks/` at root level.

---

## 4. Hooks (`src/hooks/`)
-   **Purpose**: Reusable logic, state management, side effects.
-   **Pagination Rule**: Pagination state & API coupling live here; UI components only receive props.

---

## 5. Pages (`src/pages/`)
-   **Purpose**: Route entry points only.
-   **Characteristics**: Compose feature components, handle routing params, no reusable UI logic.
-   **❌ Styling**: Pages should NOT add their own padding wrappers. The `Layout` component provides consistent padding (`p-4 md:p-6`).

---

## 6. Feedback & Interaction

### 6.1 Toast Notifications
-   **Rule**: Always use `useToast()` from `@/hooks/useToast`.
-   Use for: Success (side-effects), Error (API failures), Warning (potential issues), Info (general updates).

### 6.2 Confirmation Flow
Destructive actions (Delete) MUST:
1.  Trigger `ConfirmationModal` (`variant="danger"`).
2.  Execute API call.
3.  Show Toast notification result.
4.  Close modal and refresh UI.

---

## 7. Styling & Icons (Strict)

### 7.1 Theme Colors Only
-   **Rule**: NEVER use hardcoded hex codes, RGB, or standard Tailwind colors (e.g., `bg-blue-500`) outside of `index.css`.
-   **Brand Colors**: `brand-primary` (#6366f1), `brand-secondary` (#06b6d4), `brand-accent` (#8b5cf6), `brand-light` (#e0e7ff).
-   **Text Colors**: `text-primary` (#f5f5f5), `text-secondary` (#a3a3a3).
-   **Semantic Colors**: `success` (#10b981), `warning` (#f59e0b), `error` (#ef4444), `info` (#3b82f6).
-   **Implementation**: Use Tailwind classes mapping to these variables (e.g., `text-brand-primary`, `bg-card`, `border-gray-border`).

### 7.2 Icons
-   **Rule**: ALL icons MUST use the `lucide-react` package. No exceptions.
-   **Consistency**: Stick to `lucide-react` for visual harmony.

### 7.3 Form Design
-   **Outside Labels**: Always place labels outside and above the input field.
-   **Help Text**: Place clearly below the label or as separate caption text.
-   **Consistency**: Use `space-y-1.5` for grouping labels with inputs.

---

## 8. Naming Conventions

-   **Components**: `PascalCase`, responsibility-based (UI) or business-meaning (Features).
-   **Variables / Functions**: `camelCase`.
-   **Constants**: `UPPER_CASE`.
-   **Type Files**: `[domain].types.ts` (e.g., `tmdb.types.ts`, `auth.types.ts`).
-   **Interfaces/Types**: `PascalCase`, prefixed with domain context (e.g., `TmdbMovie`, `ButtonProps`).

---

## 9. Golden Rule

> **Design-system components are named by UI responsibility.**
> **Feature components are named by business meaning.**

---

## 10. Web Interface Guidelines (Vercel Compliance)

To ensure a premium, accessible, and performant user experience, follow these guidelines:

### 10.1 Accessibility
-   **Icon-only buttons**: MUST have `aria-label`.
-   **Forms**: MUST have `<label>` or `aria-label`.
-   **Interactive elements**: MUST have keyboard handlers (`onKeyDown`/`onKeyUp`).
-   **Semantic HTML**: Use `<button>` for actions, `<a>`/`<Link>` for navigation. NEVER use `<div onClick>`.
-   **Icons**: Decorative icons MUST have `aria-hidden="true"`.
-   **Async Updates**: Toasts and validation messages MUST have `aria-live="polite"`.

### 10.2 Focus & Interaction
-   **Focus States**: MUST have visible focus (e.g., `focus-visible:ring-2`). NEVER use `outline-none` without a replacement.
-   **Hover States**: Buttons/links MUST have distinct `hover:` styles for visual feedback.
-   **Touch**: Use `touch-action: manipulation` to prevent double-tap zoom delay.

### 10.3 Forms & Validation
-   **Inputs**: MUST have `autocomplete` and meaningful `name`.
-   **Spellcheck**: Disable on emails, codes, and usernames (`spellCheck={false}`).
-   **Placeholders**: End with `…` (e.g., `Search movies…`).
-   **Submit State**: Stay enabled until request starts; show spinner during request.

### 10.4 Typography & Content
-   **Punctuation**: Use `…` (ellipsis character) instead of `...`. Use curly quotes `"` `"`.
-   **Loading**: Loading states MUST end with `…` (e.g., `Loading…`).
-   **Truncation**: Use `truncate` or `line-clamp-*` for long text; flex children need `min-w-0`.
-   **Numbers**: Use `font-variant-numeric: tabular-nums` for columns/comparisons.

### 10.5 Animation & Performance
-   **Properties**: Animate ONLY `transform` and `opacity`. NEVER use `transition: all`.
-   **Reduced Motion**: Honor `prefers-reduced-motion`.
-   **Images**: MUST have explicit `width` and `height` to prevent Layout Shift (CLS). Use `loading="lazy"` for below-fold images.

---

## 11. Responsive Design (Enforced)

The application MUST be fully responsive and look premium on all devices (mobile, tablet, desktop).

-   **Mobile-First Approach**: Design and build for mobile first, then scale up using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
-   **Flexible Layouts**: Use Flexbox and Grid for all layouts. NEVER use fixed widths (e.g., `w-[500px]`) that can break on smaller screens. Use percentages, `fr` units, or max-widths.
-   **Touch Targets**: Interactive elements (buttons, links) MUST have a minimum hit area of `44x44px` on mobile.
-   **No Horizontal Scrolling**: The main page content MUST NOT trigger horizontal scrollbars.
-   **Safe Areas**: Use `env(safe-area-inset-*)` for devices with notches (handled by the global Layout padding).
-   **Stacking**: Content should stack vertically on small screens and expand to multi-column layouts on larger screens.

---

## 12. TypeScript Standards (Strict)

### 12.1 General Rules
-   **Strict Mode**: `tsconfig.app.json` enforces `strict: true`. Never disable it.
-   **No `any`**: The `any` type is strictly forbidden unless absolutely unavoidable (e.g., third-party library gaps). Document the reason with a `// eslint-disable-next-line` comment.
-   **Prefer `unknown`**: Use `unknown` over `any` for truly unknown types, then narrow with type guards.
-   **Explicit Return Types**: Functions with non-trivial logic SHOULD have explicit return types. Simple arrow functions can rely on inference.
-   **`as` Assertions**: Minimize use of `as`. Prefer type narrowing (type guards, `instanceof`, `in`).

### 12.2 Component Typing
-   **Props Interfaces**: Define a `[ComponentName]Props` interface for every component.
-   **Extend HTML Attributes**: Use `React.ButtonHTMLAttributes<HTMLButtonElement>`, `React.InputHTMLAttributes<HTMLInputElement>`, etc. to extend native element props.
-   **`children`**: Type as `React.ReactNode`.
-   **No `React.FC`**: Use regular function declarations or typed arrow functions. `React.FC` is discouraged due to implicit `children` and other quirks.
-   **Variant/Size Maps**: Use `Record<VariantType, string>` for style lookup maps.

```tsx
// ✅ Correct
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}
const Button = ({ variant = 'primary', ...props }: ButtonProps) => { ... };

// ❌ Wrong
const Button: React.FC<{ variant?: string }> = (props) => { ... };
```

### 12.3 Redux Toolkit Typing
-   **Store Types**: Export `RootState` and `AppDispatch` from `store/index.ts`.
-   **Typed Hooks**: Always use `useAppDispatch` and `useAppSelector` from `hooks/useRedux.ts`. NEVER use untyped `useDispatch`/`useSelector`.
-   **Slice Typing**: Define `interface [Slice]State` for each slice's state shape. Use `PayloadAction<T>` for reducers.
-   **RTK Query**: Type all endpoints with request arg and response types: `builder.query<ResponseType, ArgType>({ ... })`.

```ts
// ✅ Correct
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

// ❌ Wrong
import { useDispatch, useSelector } from 'react-redux';
```

### 12.4 API & Data Typing
-   **Response Types**: Define in `src/types/[domain].types.ts` (e.g., `tmdb.types.ts`).
-   **Paginated Responses**: Use generic `PaginatedResponse<T>` interfaces.
-   **Null vs Undefined**: API fields that can be absent should be `T | null` (matching API reality), not `T | undefined`.
-   **Barrel Exports**: Re-export all types from `src/types/index.ts` for clean imports.

### 12.5 Firebase Typing
-   **Config**: Type Firebase config objects as `FirebaseOptions`.
-   **Services**: Explicitly type exports (`Auth`, `Firestore`, `FirebaseStorage`).
-   **Firestore Data**: Define interfaces for document shapes and use `DocumentData` / typed converters.

### 12.6 Environment Variables
-   **Typed via `env.d.ts`**: All `VITE_*` env vars MUST be declared in `src/types/env.d.ts` with `ImportMetaEnv`.
-   **Access**: Always access via `import.meta.env.VITE_*`. Never use `process.env`.

### 12.7 Async & Error Handling
-   **Typed Promises**: Async functions MUST have typed return values: `Promise<Movie[]>`, not `Promise<any>`.
-   **Error Narrowing**: In `catch` blocks, narrow errors with `instanceof Error` before accessing `.message`.
-   **RTK Query Errors**: Use RTK Query's error types (`FetchBaseQueryError`, `SerializedError`) for error handling.

```ts
// ✅ Correct
try { ... }
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
}

// ❌ Wrong
catch (error: any) { console.log(error.message); }
```

### 12.8 Import Ordering
All imports MUST follow this order, separated by blank lines:

1.  **React / Framework** — `react`, `react-dom`, `react-router-dom`
2.  **Third-Party Libraries** — `@reduxjs/toolkit`, `firebase`, `lucide-react`, `framer-motion`
3.  **Internal Modules** — `@/store`, `@/hooks`, `@/api`
4.  **Type-Only Imports** — `import type { ... }` (grouped with their origin)
5.  **Relative Imports** — `./components`, `../utils`
6.  **Styles** — `./styles/index.css`

```ts
// ✅ Correct order
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Button from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
```

### 12.9 File Naming Standards
-   **Components**: `PascalCase.tsx` (e.g., `Button.tsx`, `MainLayout.tsx`).
-   **Hooks**: `camelCase.ts` (e.g., `useToast.ts`, `useRedux.ts`).
-   **Types**: `[domain].types.ts` (e.g., `tmdb.types.ts`, `auth.types.ts`).
-   **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`).
-   **Store Slices**: `camelCase.ts` (e.g., `movieSlice.ts`).
-   **API Services**: `camelCase.ts` (e.g., `tmdbApi.ts`).
-   **Config**: `camelCase.ts` (e.g., `firebase.ts`).

### 12.10 Reusable Type Organization
-   **Global Types** (`src/types/`): Types shared across 2+ features.
-   **Feature Types** (`features/[domain]/types.ts`): Types used only within a single feature.
-   **Component Types**: Props interfaces live in the same file as the component.
-   **Barrel File** (`src/types/index.ts`): Re-exports all global types.

### 12.11 TSX Component Structure
Every `.tsx` file SHOULD follow this internal structure:

```tsx
// 1. Imports (ordered per §12.8)
import { useState } from 'react';
import type { ReactNode } from 'react';

// 2. Types & Interfaces
interface ComponentProps { ... }

// 3. Constants (variant maps, static data)
const variants: Record<Variant, string> = { ... };

// 4. Component
const Component = ({ prop }: ComponentProps) => { ... };

// 5. Export
export default Component;
```

### 12.12 TMDb Media Handling
- **Type Guards**: Use `'title' in media ? media.title : media.name` to handle polymorphic media types (Movies vs TV Shows).
- **Polymorphism**: Prefer `TmdbMedia` (union type) when dealing with trending or search results that can return multiple entity types.
- **Backdrops**: Always handle potentially missing backdrops with a fallback or conditional rendering.

---

## 13. Documentation Integrity

- **Source of Truth**: `rules.md` and `files.md` are the single source of truth for the project.
- **Mandatory Updates**: Whenever a new file is created, a folder structure is changed, or a new architectural pattern is introduced, the corresponding documentation (`files.md` and/or `rules.md`) **MUST** be updated in the same task.
- **Consistency**: Never allow the codebase and these documentation files to become inconsistent.
