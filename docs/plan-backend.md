# Backend Fix Plan

## CRITICAL / HIGH

### 1. Session token is a fixed string 'authenticated'

**Current problem:**
- `app/api/admin/login/route.ts:9` sets cookie value to the fixed string `'authenticated'`.
- `app/api/posts/route.ts:7` checks `=== 'authenticated'`.
- Anyone can forge the cookie manually to bypass authentication.

**Fix approach:**
- On successful login, generate a random session token using `crypto.randomUUID()`.
- Store the token server-side. Two options:
  - **Option A (Simple):** Store in a Supabase `admin_sessions` table with columns `(token, created_at, expires_at)`.
  - **Option B (Stateless):** Sign a JWT containing `{ role: 'admin', iat, exp }` using a `SESSION_SECRET` env var, and verify it on each request.
- Recommended: **Option A** for simplicity given the single-admin use case.
- On login, insert token into `admin_sessions` and set it as the cookie value.
- On authentication check, query `admin_sessions` to verify the token exists and is not expired.
- On logout (`DELETE /api/admin/login`), delete the token from `admin_sessions`.

**Files to modify:**
- `app/api/admin/login/route.ts` - generate token, store in DB, set cookie
- `app/api/posts/route.ts` - update `isAuthenticated()` to verify token from DB
- `.env.local.example` - add `SESSION_SECRET` if using JWT (Option B only)

**Impact:**
- Admin login/logout flow changes
- All authenticated API endpoints affected (posts CRUD)
- Need to create `admin_sessions` table migration

**New files:**
- `supabase/migrations/20240102_create_admin_sessions.sql`
- `lib/auth.ts` - shared authentication utility (see also issue #3, #4)

---

### 2. Middleware does not validate cookie value

**Current problem:**
- `middleware.ts:6-8` only checks if the `admin_session` cookie exists (`request.cookies.get('admin_session')`), not its value.
- Any cookie value (even empty or garbage) passes the middleware check.

**Fix approach:**
- After issue #1 is fixed, the middleware should validate the token.
- For Option A (DB token): middleware cannot easily query the DB (Edge Runtime limitation). Instead:
  - Middleware keeps the existence check as a lightweight gate (redirects unauthenticated users to login page).
  - Actual security enforcement stays in the API route `isAuthenticated()` function which runs in Node.js runtime and can query DB.
  - Add value check: `session?.value && session.value !== ''` as a minimum.
- For Option B (JWT): middleware can verify the JWT signature since `jose` library works in Edge Runtime.
- Recommended: keep middleware as a UX redirect layer, rely on API-level auth for security.

**Files to modify:**
- `middleware.ts` - add basic value validation

**Impact:**
- Admin page routing behavior
- Low risk since API-level auth is the real security boundary

---

### 3. Quick Memos API has no authentication

**Current problem:**
- `app/api/quick-memos/route.ts` has no auth check on POST (create) or DELETE endpoints.
- Supabase RLS policy (`supabase/migrations/20240101_create_quick_memos.sql:16-19`) allows all operations.
- Anyone can create spam memos or delete existing ones.

**Fix approach:**
- Extract the `isAuthenticated()` function from `app/api/posts/route.ts` into a shared `lib/auth.ts` utility.
- Import and use it in `app/api/quick-memos/route.ts` for POST and DELETE handlers.
- GET can remain public (memos are displayed on the public site).
- Optionally tighten the Supabase RLS policy:
  - Allow SELECT for anonymous users.
  - Restrict INSERT/DELETE to authenticated (service role) access only.

**Files to modify:**
- `lib/auth.ts` (new) - shared `isAuthenticated()` function
- `app/api/quick-memos/route.ts` - add auth check to POST and DELETE
- `app/api/posts/route.ts` - import `isAuthenticated` from `lib/auth.ts` instead of local definition

**Impact:**
- Quick Memo creation/deletion will require admin login
- Frontend admin UI for Quick Memos should already be behind `/admin` route

---

## MEDIUM

### 4. Posts GET API exposes drafts without authentication

**Current problem:**
- `app/api/posts/route.ts:10-24` GET handler calls `getAllPostsAdmin()` which returns all posts including drafts.
- No authentication check on GET requests.
- Draft posts (unpublished content) are exposed to anyone who calls the API.

**Fix approach:**
- Add auth check to the GET handler.
- If authenticated: return all posts via `getAllPostsAdmin()` (current behavior).
- If not authenticated: return 401 Unauthorized.
- Note: the public-facing blog pages use `lib/posts.ts` functions directly (server components), not this API route, so this change does not affect public blog rendering.

**Files to modify:**
- `app/api/posts/route.ts` - add `isAuthenticated()` check to GET handler

**Impact:**
- Only admin users can access the posts API
- Public blog pages are unaffected (they use server-side `getAllPosts()` directly)

---

### 5. Posts API has no input validation

**Current problem:**
- `app/api/posts/route.ts:31-32` (POST) and `:46-47` (PUT) pass `request.json()` body directly to `createPost(body)` / `updatePost(body)`.
- No validation of required fields (title, slug, content).
- Missing or malformed data goes straight to Supabase.

**Fix approach:**
- Add validation before calling `createPost` / `updatePost`.
- POST validation (create):
  - `title`: required, non-empty string
  - `slug`: required, non-empty string, URL-safe format (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`)
  - `content`: required, non-empty string
  - `category`: optional, must be a valid category ID if provided
  - `status`: optional, must be `'draft'` or `'published'` if provided
  - `tags`: optional, must be string array if provided
- PUT validation (update):
  - `id`: required, non-empty string
  - All other fields: same rules as POST but all optional
- Return 400 with descriptive error messages for validation failures.

**Files to modify:**
- `app/api/posts/route.ts` - add validation logic to POST and PUT handlers

**Impact:**
- Better error messages for invalid input
- Prevents garbage data in the database

---

### 6. request.json() parsing errors are unhandled

**Current problem:**
- `app/api/admin/login/route.ts:5`, `app/api/posts/route.ts:31,46`, `app/api/quick-memos/route.ts:13`
- All API routes call `await request.json()` without try-catch.
- Malformed JSON body causes an unhandled exception and 500 error.

**Fix approach:**
- Wrap `request.json()` calls in try-catch blocks.
- Return 400 Bad Request with `{ error: 'Invalid JSON body' }` on parse failure.
- Can create a small helper in `lib/api-utils.ts`:
  ```
  async function parseJsonBody<T>(request: Request): { data: T } | { error: Response }
  ```
- Alternatively, add try-catch directly in each handler (simpler, less abstraction).
- Recommended: direct try-catch in each handler since there are only 3 API routes.

**Files to modify:**
- `app/api/admin/login/route.ts` - wrap `request.json()` in try-catch
- `app/api/posts/route.ts` - wrap `request.json()` in try-catch (POST, PUT handlers)
- `app/api/quick-memos/route.ts` - wrap `request.json()` in try-catch (POST handler)

**Impact:**
- Proper 400 responses instead of 500 for malformed requests
- Minimal code change per file

---

### 7. Quick Memos limit parameter has no upper bound

**Current problem:**
- `app/api/quick-memos/route.ts:6` parses `limit` from query params with no upper bound.
- `limit=999999` would attempt to fetch all rows from the database.
- Also, negative values or NaN are not handled (`parseInt` returns NaN for non-numeric strings).

**Fix approach:**
- Clamp the limit value: `Math.min(Math.max(parsedLimit || 10, 1), 50)`.
  - Default: 10
  - Minimum: 1
  - Maximum: 50
- If `parseInt` returns `NaN`, fall back to the default of 10.

**Files to modify:**
- `app/api/quick-memos/route.ts` - add limit clamping logic

**Impact:**
- Prevents excessive database queries
- Minimal code change (1-2 lines)

---

## Implementation Order

Recommended order to minimize conflicts and dependencies:

1. **Create `lib/auth.ts`** - shared auth utility (foundation for #1, #3, #4)
2. **Issue #1** - fix session token generation (most critical)
3. **Issue #2** - update middleware validation
4. **Issue #3** - add auth to Quick Memos API
5. **Issue #4** - add auth to Posts GET API
6. **Issue #6** - add JSON parsing error handling
7. **Issue #5** - add input validation to Posts API
8. **Issue #7** - add limit clamping to Quick Memos
