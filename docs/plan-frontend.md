# Frontend Fix Plan

## Issue 1. Dark/Light Mode Color System Broken (CRITICAL)

### Problem
- `:root` in `globals.css` sets `--background: #262629` (dark color) as default, so there is no light mode definition.
- `.dark` class only changes to a slightly different dark color (`#1a1a1c`).
- `body { background: var(--background) }` in `globals.css` overrides Tailwind's `bg-white dark:bg-black` on `<body>` in `layout.tsx`.
- The `@media (prefers-color-scheme: dark)` block in `globals.css` is redundant because the project uses class-based dark mode via `next-themes` (`darkMode: 'class'` in `tailwind.config.ts`).

### Fix Strategy
Redesign CSS variables to support both light and dark themes. Use `.dark` class selector for dark mode, and bare `:root` for light mode.

### Changes

**File: `globals.css`**
```
:root {
  --background: #ffffff;
  --foreground: #1a1a1c;
  --teal: #0e997c;
  --rose: #d2698b;
}

.dark {
  --background: #262629;
  --foreground: #f2f4f4;
}
```
- Remove the `@media (prefers-color-scheme: dark)` block entirely (lines 12-17). The class-based system handles this.
- Update `body` rule: keep `color: var(--foreground); background: var(--background);` as-is (it will now correctly respond to `.dark` class).
- Update scrollbar styles (lines 30-45) to use CSS variables or add `.dark` variants.
- Update `.prose :not(pre) > code` dark mode (lines 80-84): change from `@media (prefers-color-scheme: dark)` to `.dark .prose :not(pre) > code`.
- Update `.prose pre` background: add light/dark variants.

**File: `layout.tsx` (line 68)**
- Remove `bg-white dark:bg-black text-gray-900 dark:text-gray-100` from `<body>` class. The CSS variables in `globals.css` now handle background and text colors, so these Tailwind classes conflict.

**File: `tailwind.config.ts`**
- No structural changes needed. `darkMode: 'class'` is correct. The `background` and `foreground` color definitions already reference CSS variables, which will now have correct light/dark values.

### Impact
All pages. This is the foundation fix that enables Issue 2 to work correctly.

---

## Issue 2. `text-light` Color Invisible in Light Mode (HIGH)

### Problem
- 129 occurrences of `text-light`, `bg-dark`, `border-light/10` across 17 files.
- `light` is hardcoded to `#f2f4f4` (near-white) and `dark` to `#262629` (near-black) in `tailwind.config.ts`.
- In light mode, `text-light` (white text) on a white background is invisible.
- In light mode, `bg-dark` (dark background) creates jarring dark blocks.

### Fix Strategy
Replace hardcoded `light`/`dark` color tokens with CSS variable-based semantic tokens that automatically adapt to the current theme.

### Changes

**File: `tailwind.config.ts`**
Replace the static `dark` and `light` color values with CSS variable references:
```ts
colors: {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  dark: 'var(--color-dark)',
  light: 'var(--color-light)',
  teal: '#0e997c',
  rose: '#d2698b',
},
```

**File: `globals.css`**
Add new CSS variables that swap in light/dark modes:
```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1c;
  --color-dark: #ffffff;      /* "dark" surfaces are white in light mode */
  --color-light: #1a1a1c;    /* "light" text is dark in light mode */
}

.dark {
  --background: #262629;
  --foreground: #f2f4f4;
  --color-dark: #262629;      /* "dark" surfaces are dark in dark mode */
  --color-light: #f2f4f4;    /* "light" text is light in dark mode */
}
```

This approach means **zero changes to the 17 component files**. All existing `text-light`, `bg-dark`, `border-light/10` classes will automatically resolve to the correct color for each theme.

### Verification Needed
- `text-light/70`, `text-light/50`, `border-light/10` etc. use Tailwind's opacity modifier. Confirm that CSS variable-based colors support opacity modifiers. Tailwind v3 requires the color to be defined in a specific format for opacity to work with CSS variables. If `var(--color-light)` is a hex value, Tailwind cannot apply opacity directly.
- **Fallback approach if opacity modifiers don't work**: Define `--color-light` using RGB format (`31 31 33`) and reference as `rgb(var(--color-light) / <alpha>)` in Tailwind config:
```ts
light: 'rgb(var(--color-light) / <alpha-value>)',
```
And in CSS:
```css
:root {
  --color-light: 26 26 28;   /* RGB without commas */
}
.dark {
  --color-light: 242 244 244;
}
```

### Impact
All 17 files with `text-light`, `bg-dark`, `border-light` usage. No file-level edits needed if CSS variable approach works.

### Affected Files (read-only, no edits needed)
- `components/PostCard.tsx`, `components/Footer.tsx`, `components/PostEditor.tsx`
- `components/Header.tsx`, `components/SearchBar.tsx`, `components/QuickMemoWidget.tsx`
- `components/CategorySidebar.tsx`
- `app/page.tsx`, `app/about/page.tsx`, `app/blog/page.tsx`
- `app/admin/page.tsx`, `app/admin/write/page.tsx`, `app/admin/login/page.tsx`
- `app/admin/edit/[id]/page.tsx`
- `app/blog/[slug]/page.tsx`, `app/blog/category/[category]/page.tsx`
- `app/blog/tag/[tag]/page.tsx`

---

## Issue 3. QuickMemo Rendered in Two Places (MEDIUM)

### Problem
- `app/page.tsx` line 127: QuickMemoWidget in the right sidebar of homepage.
- `components/CategorySidebar.tsx` lines 64-67: QuickMemoWidget at the bottom of the category sidebar.
- `blog/layout.tsx` uses CategorySidebar, so `/blog` and `/blog/category/*` pages also show QuickMemo.
- Result: QuickMemo appears on both the homepage (right sidebar) AND blog pages (left sidebar), which is confusing.

### Fix Strategy
Keep QuickMemo only in CategorySidebar (which appears on blog-related pages). Remove it from the homepage right sidebar, since the homepage already has its own layout with the "write" button in the right sidebar.

### Changes

**File: `app/page.tsx`**
- Remove lines 127 (`<QuickMemoWidget />`) from the right sidebar.
- Remove import of `QuickMemoWidget` (line 4) since it will no longer be used on this page.
- Keep the "write" button in the right sidebar as-is.

### Alternative
If the preference is to show QuickMemo on the homepage too, then remove it from `CategorySidebar.tsx` (lines 64-67) instead, and keep both the "write" button and QuickMemo in the homepage right sidebar. But this means blog pages won't have QuickMemo at all.

### Impact
- `app/page.tsx` (edit)
- `components/CategorySidebar.tsx` (no change)

---

## Issue 4. Accessibility Issues (MEDIUM)

### Problem A: Delete button hidden from keyboard users
- `QuickMemoWidget.tsx` line 157: delete button uses `opacity-0 group-hover:opacity-100` which makes it invisible to keyboard-only users who tab to the button.

### Problem B: Mobile menu has no Escape key handler
- `Header.tsx`: the mobile menu opens/closes via button click, but pressing Escape does nothing. Keyboard and screen reader users expect Escape to close overlay menus.

### Changes

**File: `components/QuickMemoWidget.tsx` (line 157)**
Add `focus:opacity-100` to the delete button's className:
```
Before: "opacity-0 group-hover:opacity-100 p-1 text-light/40 hover:text-rose transition-all"
After:  "opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-light/40 hover:text-rose transition-all"
```

**File: `components/Header.tsx`**
Add a `useEffect` to listen for Escape key when `isMenuOpen` is true:
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isMenuOpen]);
```
Place this after the existing `useState` on line 8.

### Impact
- `components/QuickMemoWidget.tsx` (1 line change)
- `components/Header.tsx` (add useEffect, ~8 lines)

---

## Issue 5. Admin Link Exposed to All Visitors (MEDIUM)

### Problem
- `Header.tsx` lines 43-61 (desktop) and lines 66-84 (mobile): the admin icon link is always visible.
- While middleware redirects unauthenticated users to the login page, exposing the admin link to all visitors is unnecessary and reveals the admin panel's existence.

### Fix Strategy
Remove the admin link from the public Header entirely. Admins can access `/admin` directly by typing the URL. The middleware handles authentication.

### Changes

**File: `components/Header.tsx`**
- Remove lines 43-61: the admin link `<Link href="/admin">` in the desktop navigation.
- Remove lines 66-84: the admin link `<Link href="/admin">` in the mobile menu area. Adjust the mobile area to only contain `<ThemeToggle />` and the hamburger button.

### Alternative (if admin link is desired for logged-in users)
Create a client-side check for the `admin_session` cookie and conditionally render the admin link. This requires making Header aware of auth state:
```tsx
const [isAdmin, setIsAdmin] = useState(false);
useEffect(() => {
  setIsAdmin(document.cookie.includes('admin_session'));
}, []);
```
Then wrap the admin link in `{isAdmin && (...)}`. However, this is a cookie-based check on the client side and the cookie may be httpOnly (need to verify). The simpler approach is to just remove the link.

### Impact
- `components/Header.tsx` (remove ~40 lines of admin link markup)
