# FRONTEND AUDIT REPORT — Icon Perfumes (Next.js)

**Date:** March 3, 2026  
**Framework:** Next.js 15.3.1 (App Router) + Redux Toolkit + Tailwind CSS + Bootstrap  
**Total Issues Found:** 62  
**Critical:** 12 | **High:** 18 | **Medium:** 22 | **Low:** 10

---

## Table of Contents

1. [State Management & Data Persistence](#1-state-management--data-persistence)
2. [API Interaction & Error Handling](#2-api-interaction--error-handling)
3. [Performance & Core Web Vitals](#3-performance--core-web-vitals)
4. [UI/UX & Responsiveness](#4-uiux--responsiveness)
5. [SEO & Meta Tags](#5-seo--meta-tags)
6. [Security Concerns](#6-security-concerns)
7. [Full Issue Tracker](#7-full-issue-tracker)

---

## 1. State Management & Data Persistence

### Architecture Overview

- **State Manager:** Redux Toolkit (12 slices in `src/app/(home)/redux/`)
- **Auth Token:** HttpOnly cookie named `token` — set by backend, sent via `credentials: "include"` / `withCredentials: true`
- **Cart (Guest):** Encrypted in `secureLocalStorage` via CryptoJS AES
- **Wishlist (Guest):** Encrypted in `secureLocalStorage` via CryptoJS AES
- **Cart/Wishlist (Logged-in):** Server-side via API calls

### 1.1 Auth Token Sync

| Aspect | Status | Details |
|--------|--------|---------|
| Token storage | ✅ Correct | HttpOnly cookie — cannot be read by JS, secure approach |
| Token sent in API calls | ✅ Correct | `credentials: "include"` on fetch, `withCredentials: true` on axios |
| Token validated in middleware | ⚠️ Broken | `middleware.js` calls `/profile/` API on every request but **discards the response** — dead code adding latency |
| Bearer Token header | ℹ️ Not used | Cookie-based auth is used instead — this is correct and secure |

### 1.2 Cart & Wishlist Sync

| Aspect | Status | Details |
|--------|--------|---------|
| Guest cart persistence | ✅ Works | Encrypted in `secureLocalStorage` via CryptoJS |
| Guest wishlist persistence | ✅ Works | Encrypted in `secureLocalStorage` via CryptoJS |
| Cart merge on login | ✅ Works | `Login.js` sends `cart_data` and `wishlist_data` to backend for merge |
| Guest data cleared post-login | ✅ Works | `secureLocalStorage.removeItem()` called after login |
| Redux cart synced with storage | ✅ Works | `saveToSession()` called after every mutation |

### 1.3 User Info Update After Login

| Aspect | Status | Details |
|--------|--------|---------|
| `fetchUser()` after login | ✅ Called | `Login.js:74` dispatches `fetchUser()` |
| `fetchCart()` after login | ✅ Called | `Login.js:75` dispatches `fetchCart()` |
| `fetchWishList()` after login | ✅ Called | `Login.js:76` dispatches `fetchWishList()` |
| `is_staff` field in context | ❌ Missing | Backend `/profile/` endpoint returns `{name, phone_number, email, username}` — **no `is_staff` field**. Any frontend code relying on `user.is_staff` will get `undefined` |
| `profile` data in context | ⚠️ Partial | `state.user` stores the full response object including `success: true` as a stray field |

---

### Critical Bugs in State Management

#### BUG #1 — `deleteUser` thunk is completely broken (CRITICAL)
**File:** `src/app/(home)/redux/userSlice.js` — Lines 37-56

```javascript
export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async ({ rejectWithValue, dispatch }) => {  // ❌ Wrong: destructures from payload, not thunkAPI
        const router = useRouter();  // ❌ React hook called outside component — CRASHES
        const json = response.json();  // ❌ Missing await — json is a Promise
        return { id, success: true };  // ❌ id is undefined — ReferenceError
        dispatch(setRedirect('/login/'))  // ❌ setRedirect not imported — ReferenceError
```

**5 bugs in one function:**
1. `useRouter()` called in async thunk — illegal hook call, crashes at runtime
2. Thunk args destructured incorrectly — `rejectWithValue`/`dispatch` will be `undefined`
3. `response.json()` missing `await` — Promise, not parsed data
4. `id` variable never declared — `ReferenceError`
5. `setRedirect` never imported — `ReferenceError`

**Severity:** Critical  
**Fix:** Rewrite the entire thunk. Pass `router` as a parameter from the component, fix arg destructuring to `async (_, { rejectWithValue, dispatch })`, add `await`, import `setRedirect`, pass `id` as parameter.

---

#### BUG #2 — Non-serializable function stored in Redux (`modalSlice.js`) (CRITICAL)
**File:** `src/app/(home)/redux/modalSlice.js` — Line 22

```javascript
state.resolve = action.payload.resolve;  // ❌ Storing a Promise resolve function
```

Redux state must be serializable. Storing a function will:
- Trigger Redux DevTools warnings
- Break time-travel debugging
- May be silently stripped by Redux's `serializableCheck` middleware — **breaking the entire OTP verification flow** (Login/SignUp will hang at `await modalPromise` forever)

**Severity:** Critical  
**Fix:** Use an event emitter pattern or callback ref instead of storing `resolve` in Redux state. Alternatively, disable serializable check for this specific path (not recommended).

---

#### BUG #3 — `addAddress` catch block references wrong variable (HIGH)
**File:** `src/app/(home)/redux/userSlice.js` — Line 101

```javascript
} catch (error) {
    dispatch(addToast({ message: json.message, type: 'error' }));  // ❌ json not in scope
}
```

`json` is declared in the `try` block and is not accessible in `catch`. This will throw `ReferenceError`, silently swallowing the real error.

**Severity:** High  
**Fix:** Change to `error.message`

---

#### BUG #4 — Guest data cleared before OTP verification in SignUp (MEDIUM)
**File:** `src/app/(home)/sign-up/SignUp.js` — Lines 70-71

```javascript
secureLocalStorage.removeItem("cart_hashData");     // ❌ Cleared BEFORE OTP verify
secureLocalStorage.removeItem("wishList_hashData");  // ❌ Data lost if OTP fails
dispatch(addToast({ message: "Account Created Successfully" })); // ❌ Premature success toast
```

If user closes OTP modal or fails verification, their guest cart/wishlist data is permanently lost.

**Severity:** Medium  
**Fix:** Move `removeItem` calls and success toasts to after `modalRes.success` check.

---

#### BUG #5 — Login form validation error never displays (MEDIUM)
**File:** `src/app/(home)/login/Login.js` — Lines 141-143

```javascript
{errors.email && (  // ❌ Field is registered as 'contact', not 'email'
    <p className="text-red-500 text-xs">{errors.email.message}</p>
)}
```

The input is registered with name `'contact'` but error display checks `errors.email`. Validation errors for email/phone will never show.

**Severity:** Medium  
**Fix:** Change `errors.email` to `errors.contact`

---

## 2. API Interaction & Error Handling

### Auth Header Pattern

| Pattern | Used In | Status |
|---------|---------|--------|
| `credentials: "include"` (fetch) | Cart, Wishlist, Profile, Checkout, Address thunks | ✅ Correct |
| `withCredentials: true` (axios) | `axiosInstance.js`, `fetchUser`, `fetchAddresses` | ✅ Correct |
| Bearer Token header | Server-side page.js in checkout | ✅ Correct |
| Token as URL query param | `Payment.js`, `PaymentSuccess.js` | ❌ Security risk |

### Error Handling Summary

| Component | API Error → Toast? | Network Error → Toast? | Blank Screen Risk? |
|-----------|--------------------|-----------------------|--------------------|
| Login | ✅ Yes | ✅ Yes | ❌ No |
| SignUp | ✅ Yes | ✅ Yes | ❌ No |
| Cart operations | ✅ Yes | ✅ Yes | ❌ No |
| Wishlist operations | ✅ Yes | ✅ Yes | ❌ No |
| Checkout | ✅ Yes | ⚠️ Redirects to `/` | ⚠️ Empty cart area |
| Payment | ⚠️ Sets `error` state | ⚠️ Sets `error` state | ❌ No |
| PaymentSuccess | ⚠️ Console only | ❌ Crashes | ✅ **YES — CRITICAL** |
| Product Detail | ❌ Error set but never rendered | ❌ No | ✅ **YES — CRITICAL** |
| Contact form | ✅ API error toast | ❌ Console.log only | ❌ No |
| Review form | ❌ Console.log only | ❌ Console.log only | ❌ No |
| Address detail | ⚠️ Delete has toast | ❌ Update: console only | ✅ **YES** |
| Profile update | ✅ Yes | ✅ Yes | ❌ No |

---

### Critical API/Error Bugs

#### BUG #6 — PaymentSuccess crashes on null sessionStorage (CRITICAL)
**File:** `src/app/(home)/payment-process/PaymentSuccess.js` — Line 60

```javascript
updatedData.txnid = txnid;  // ❌ updatedData can be null if decryption fails
```

If `sessionStorage` is empty or `decryptData()` fails, `updatedData` is `null`. Setting property on `null` → `TypeError` → **blank screen crash** during payment verification. User will not know if payment succeeded.

**Severity:** Critical  
**Fix:** Add null guard: `if (!updatedData) { setStatus("error"); return; }`

---

#### BUG #7 — Product Detail page crashes on API failure (CRITICAL)
**File:** `src/app/(home)/[...slug]/page.js` — Lines 343-348

```javascript
// 3-slug path: NO null check on fetchProduct result
const data = await fetchProduct(productSlug);
// ❌ data can be undefined if API fails
return <Detail detailData={data} ... />  // crashes
```

`fetchProduct()` returns `undefined` on error (catch block logs but doesn't return). `Detail.js` then crashes on `variant.images.map()` when `variant` is undefined.

**Severity:** Critical  
**Fix:** Add `if (!data) return notFound();` after `fetchProduct()` call (already done for 2-slug path but missing for 3-slug).

---

#### BUG #8 — Address detail page crashes on API failure (HIGH)
**File:** `src/app/(home)/profile/addresses/[id]/page.js` — Line 47

```javascript
<AddressDetail address={data.address} id={params.id} />  // ❌ data can be null
```

No null check on `data` before accessing `data.address`. Returns `notFound()` only for `!data.success` but if `data` itself is null (network error), this crashes.

**Severity:** High  
**Fix:** Add `if (!data) return notFound();` before the success check.

---

#### BUG #9 — OrderId.js references undefined `error` variable (HIGH)
**File:** `src/app/(home)/profile/orders/[orderId]/OrderId.js` — Line 131

```javascript
{error ? null : <div>...  // ❌ error is never defined in this component
```

`error` is not declared anywhere in the component. If this code path executes, it throws `ReferenceError` → blank screen.

**Severity:** High (latent — protected by `notFound()` in page.js, but still a crash risk)  
**Fix:** Remove the `error` check or declare `error` state.

---

#### BUG #10 — Payment.js missing Content-Type header (HIGH)
**File:** `src/app/(home)/payment/Payment.js` — Lines 67-70

```javascript
const response = await fetch(`${api_url}/card-payment/?token=${token}`, {
    credentials: "include",
    method: "POST",
    body: JSON.stringify(updatedData)  // ❌ No Content-Type header
});
```

Sending `JSON.stringify()` without `"Content-Type": "application/json"` means the server may not parse the request body correctly.

**Severity:** High  
**Fix:** Add `headers: { "Content-Type": "application/json" }` to the fetch options.

---

#### BUG #11 — OTP resend missing Content-Type and credentials (MEDIUM)
**File:** `src/app/(home)/components/OTP.js` — Lines 78-80

```javascript
const response = await fetch(`${api_url}/send-otp/`, {
    method: "POST",
    body: JSON.stringify({ email: modalProps.email })
    // ❌ Missing headers: {"Content-Type": "application/json"}
    // ❌ Missing credentials: "include"
})
```

**Severity:** Medium  
**Fix:** Add both `headers` and `credentials` options.

---

#### BUG #12 — ResetPassword catch uses `JSON.message` (MEDIUM)
**File:** `src/app/(home)/login/reset-password/[token]/ResetPassword.js` — Line 47

```javascript
} catch(error) {
    dispatch(addToast({message: JSON.message, type:'error'}))  // ❌ JSON.message is undefined
}
```

`JSON` is the global JavaScript object (for `JSON.parse`, `JSON.stringify`). `JSON.message` is always `undefined`. Should be `error.message`.

**Severity:** Medium  
**Fix:** Change `JSON.message` to `error.message`

---

#### BUG #13 — Contact form network error is silent (MEDIUM)
**File:** `src/app/(home)/contact/Contact.js` — Line 48

```javascript
} catch (error) {
    console.log(error);  // ❌ No toast, no user feedback
}
```

User submits contact form, network fails, form just stops loading with no feedback.

**Severity:** Medium  
**Fix:** Add `dispatch(addToast({ message: "Something went wrong. Please try again.", type: "error" }))`

---

#### BUG #14 — Detail.js error state set but never rendered (MEDIUM)
**File:** `src/app/(home)/components/Detail.js`

```javascript
setMyError("Product Not Found");  // Error state is set...
// ...but myError is NEVER rendered anywhere in the JSX
```

If product data fails to load, no error message is shown to the user.

**Severity:** Medium  
**Fix:** Add conditional render: `{myError && <p className="text-red-500">{myError}</p>}`

---

#### BUG #15 — Middleware API call is dead code (HIGH)
**File:** `src/middleware.js` — Lines 34-41

```javascript
const response = await fetch(`${backend_url}/profile/`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json", Cookie: cookieString },
});
const data = await response.text();
// ❌ data is NEVER used — this call adds latency for nothing
```

Every request to `/profile/*` routes makes an unnecessary backend API call that is completely ignored.

**Severity:** High  
**Fix:** Either use the response for auth validation or remove the fetch call entirely.

---

## 3. Performance & Core Web Vitals

### 3.1 Image Optimization

| Status | Details |
|--------|---------|
| ✅ `next/image` usage | Most components correctly use `next/image`: Banner, HeroBanner, Product, Product2, Detail, Hero, Category, Footer, Navbar1 |
| ❌ Raw `<img>` tags | 2 instances found |
| ❌ Empty `alt` attributes | 9 instances across 6 files |

#### Raw `<img>` Tags (Should use `next/image`)

| # | File | Line | Element |
|---|------|------|---------|
| 1 | `src/app/(home)/not-found.js` | 7 | `<img src="/images/not_found.jpg"` |
| 2 | `src/app/(home)/shop/Shop.js` | ~315 | `<img src="/images/no_product.svg"` |

**Severity:** Medium  
**Fix:** Replace with `import Image from 'next/image'` and use `<Image>` component.

#### Empty `alt=""` Attributes (SEO/Accessibility Issue)

| File | Lines |
|------|-------|
| `sign-up/SignUp.js` | 211 |
| `login/Login.js` | 185 |
| `login/reset-password/[token]/ResetPassword.js` | 108 |
| `login/forgot-password/ForgotPassword.js` | 82 |
| `components/Category.js` | 101 |
| `components/Detail.js` | 314, 375 |
| `components/Review_swiper.js` | 65 |
| `checkout/Checkout.js` | 444 |

**Severity:** Medium  
**Fix:** Add descriptive `alt` text to all images.

#### Missing `alt` Prop Entirely

| File | Line | Element |
|------|------|---------|
| `components/Product2.js` | 45 | `<Image src={...} width={500} height={500} />` — no `alt` at all |

**Severity:** Medium  
**Fix:** Add `alt={product.name}` or similar.

---

### 3.2 Hydration Errors

#### BUG #16 — `Math.random()` in SSR-rendered component (MEDIUM)
**File:** `src/components/ui/sidebar.jsx` — Line 529

```javascript
const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
}, [])  // ❌ useMemo with empty deps + Math.random = different values on server vs client
```

**Hydration mismatch guaranteed.** Server renders one random width, client renders a different one.

**Severity:** Medium  
**Fix:** Use a deterministic value or render only on client with `useEffect`.

---

#### BUG #17 — `next/head` used in App Router layout (CRITICAL)
**File:** `src/app/(home)/layout.js` — Lines 16, 89

```javascript
import Head from 'next/head';  // ❌ next/head does NOT work in App Router

<Head>
    <meta name="google-site-verification" content="v0AIuIpbm2jX9t1dfgTCUO32JUrIujl6dAgQiS1bNTk" />
</Head>
// This entire <Head> block is SILENTLY IGNORED
```

The `next/head` component is a **Pages Router** feature. In the App Router, metadata is handled via `export const metadata = {...}` (which already exists in the file with the same verification code). This `<Head>` component renders nothing.

**Severity:** Critical (but mitigated because `metadata.verification.google` already has the code)  
**Fix:** Remove the `import Head from 'next/head'` and the `<Head>` JSX block entirely. The `metadata` export already handles it.

---

#### BUG #18 — `Welcome.js` missing `'use client'` directive (LOW)
**File:** `src/app/(home)/components/Welcome.js` — Line 1

Uses `useState`, `useEffect`, `useRef`, `useDispatch`, `useSelector` — all client-only hooks — but has no `'use client'` directive.

**Severity:** Low (works because parent component has it, but fragile)  
**Fix:** Add `'use client';` at line 1.

---

### 3.3 Unused & Heavy Libraries

#### MUST REMOVE — Unused Dependencies

| Package | Version | Why Remove | Estimated Savings |
|---------|---------|-----------|-------------------|
| `razorpay` | ^2.9.6 | **Node.js server SDK** imported in client component (`Checkout.js:26`) but never called. Backend uses PayU, not Razorpay. | ~1.5MB |
| `@stripe/stripe-js` | ^5.6.0 | Imported in `Checkout.js:22` but `loadStripe()` never called. Payment goes through PayU. | ~50KB gzipped |
| `jquery` | ^3.7.1 | Zero imports/requires anywhere in `src/` | ~87KB minified |
| `fs` | ^0.0.1-security | Node.js built-in stub — should NEVER be in frontend deps | Minimal |
| `crypto` | ^1.0.1 | Node.js built-in stub — code uses `crypto-js` instead | Minimal |
| `icons` | ^1.0.0 | Zero imports — codebase uses `react-icons` | Minimal |
| `icones` | ^1.0.0 | Zero imports anywhere | Minimal |
| `nextjs` | ^0.0.3 | Abandoned npm package — NOT the same as `next` | Minimal |
| `photoviewer` | ^3.10.3 | Zero imports anywhere | Minimal |
| `react-owl-carousel` | ^2.3.3 | Zero imports — codebase uses `swiper` instead | ~20KB |

**Severity:** High (supply chain risk, bundle bloat, install time)  
**Fix:** `npm uninstall razorpay @stripe/stripe-js jquery fs crypto icons icones nextjs photoviewer react-owl-carousel`

#### REVIEW — Potentially Redundant

| Package | Status | Issue |
|---------|--------|-------|
| `bootstrap` | Used (`layout.js:2`) | **Full Bootstrap CSS (~190KB)** loaded alongside Tailwind CSS. Creates class conflicts and CSS bloat. |
| `photoswipe` | Indirect | Peer dependency of `react-photoswipe-gallery` — may be needed. Verify usage. |

**Severity:** High (bootstrap CSS bloat)  
**Fix:** Replace Bootstrap grid classes with Tailwind equivalents (`grid`, `flex`, responsive prefixes). Then remove `bootstrap` from deps.

---

#### BUG #19 — `razorpay` (Node SDK) imported in client component (CRITICAL)
**File:** `src/app/(home)/checkout/Checkout.js` — Line 26

```javascript
import Razorpay from "razorpay";  // ❌ Server-only Node.js SDK in client component
```

This is a server-side Node.js SDK imported in a `'use client'` component. It may cause:
- Build errors (Node.js APIs not available in browser)
- Massive bundle size increase
- Runtime crashes

**Severity:** Critical  
**Fix:** Remove this import entirely. The project uses PayU for payments.

---

### 3.4 Console Statements in Production

**70 `console.log` statements** found across the codebase. Key security concern:

#### BUG #20 — Auth token logged in middleware (CRITICAL)
**File:** `src/middleware.js` — Line 10

```javascript
console.log(token);  // ❌ Logs auth token on EVERY request
```

**Severity:** Critical (security)  
**Fix:** Remove this `console.log` immediately.

#### Other Heavy Offenders

| File | Count |
|------|-------|
| `redux/cartSlice.js` | 6 |
| `components/Footer.js` | 4 |
| `components/Newsletter.js` | 4 |
| `payment/Payment.js` | 4 |
| `profile/Profile.js` | 4 |
| `[...slug]/page.js` | 4 |
| `components/Detail.js` | 3 |
| `redux/wishListSlice.js` | 3 |

**Severity:** Medium  
**Fix:** Remove all `console.log` statements or replace with a proper logging library that can be disabled in production.

---

## 4. UI/UX & Responsiveness

### 4.1 Design Approach

**Desktop-First** — All base styles target desktop, with `@media (max-width: ...)` overrides for mobile.

#### Inconsistent Breakpoints

| Breakpoint | Used In | Issue |
|------------|---------|-------|
| 1199px | navbar, cart, detail, checkout | OK — standard |
| 999px | navbar, index.css | Non-standard |
| 992px | detail.module.css | Standard BS breakpoint |
| 769px | checkout.module.css | ❌ Should be 768px |
| 768px | navbar, cart, detail, shop | Standard |
| 599px | navbar, detail, shop, index.css | Non-standard |
| 549px | detail.module.css | Non-standard |
| 499px | navbar, cart, detail, index.css | Non-standard |
| 449px | navbar, shop | Non-standard |
| 399px | navbar, shop, detail, index.css | Non-standard |

Inconsistent breakpoints (e.g., 769 vs 768) can cause 1px rendering gaps where neither query applies.

**Severity:** Medium  
**Fix:** Standardize breakpoints to match common device widths: 1200, 992, 768, 576, 480, 360.

---

### 4.2 Loading States & Skeletons

| Page | Has Loading State? | Type | Issue |
|------|--------------------|------|-------|
| Home | ❌ No | — | Products render after SSR fetch completes |
| Shop | ⚠️ Suspense only | `<span class="loader">` spinner | No skeleton, JSX uses `class` instead of `className` |
| Product Detail | ❌ No | — | No loading/skeleton state while product initializes |
| Checkout | ❌ No | — | No loading state while totals calculate |
| Cart (drawer) | ❌ No | — | Uses global Redux loader overlay |
| Wishlist | ❌ No | — | No loading state while fetching |
| Profile | ❌ No | — | No loading state |
| Blog | ⚠️ Suspense only | Spinner | Minimal |

#### BUG #21 — No `loading.js` files exist (HIGH)
**Zero `loading.js` files** found in the entire app directory. Next.js App Router uses `loading.js` to show instant loading UI during route transitions. Without them, users see the previous page until the new page fully loads on the server.

**Severity:** High  
**Fix:** Create `loading.js` files in key directories:
```
src/app/(home)/loading.js
src/app/(home)/shop/loading.js
src/app/(home)/profile/loading.js
src/app/(home)/checkout/loading.js
```

Each should export a skeleton/loading component.

#### BUG #22 — Skeleton component exists but is unused (MEDIUM)
**File:** `src/components/ui/skeleton.jsx`

The `Skeleton` component exists (from ShadCN UI) but is **only used in `sidebar.jsx`** — not in any actual product, shop, or checkout page.

**Severity:** Medium  
**Fix:** Create product card skeletons, shop page skeletons, and detail page skeletons using the existing `Skeleton` component.

---

### 4.3 Mobile Layout Assessment

| Component | Mobile Behavior | Status |
|-----------|----------------|--------|
| Navbar | Hamburger menu + mobile search | ✅ Good |
| Mobile menu | Slide-in with category accordion | ✅ Good |
| Cart drawer | Full-width on mobile (<499px) | ✅ Good |
| Shop grid | 2 columns on mobile (`col-6`) | ✅ Good |
| Product detail | Stacked layout, horizontal thumbnails | ✅ Good |
| Checkout | Stacked sections on mobile | ✅ Good |
| Wishlist grid | 2 columns on mobile (`col-6`) | ✅ Good |
| Footer | Stacks vertically | ✅ Good |

**Overall mobile layout is functional.** Main concern is the Bootstrap + Tailwind CSS mix causing potential class conflicts and larger CSS payload.

---

### 4.4 `class` vs `className` in JSX

#### BUG #23 — HTML `class` attribute used instead of `className` (MEDIUM)

| File | Lines |
|------|-------|
| `sign-up/page.js` | 19 |
| `[...slug]/page.js` | ~309, ~337, ~354 |

```html
<span class="loader"></span>  <!-- ❌ Should be className="loader" -->
```

React will show console warnings and the class may not apply correctly in strict mode.

**Severity:** Medium  
**Fix:** Replace all `class=` with `className=` in JSX files.

---

## 5. SEO & Meta Tags

### 5.1 Dynamic Metadata

| Page Type | Dynamic Title? | Dynamic Description? | Status |
|-----------|---------------|---------------------|--------|
| Home page | ✅ Static (good) | ✅ Static | OK |
| Product pages | ✅ Yes (`generateMetadata`) | ✅ Yes | OK |
| Category pages | ✅ Yes (`generateMetadata`) | ✅ Yes | OK |
| Blog posts | ✅ Yes (`generateMetadata`) | ✅ Yes | ⚠️ But set to `noindex` |
| Shop page | ❌ No (inherits root) | ❌ No | ❌ Missing |
| Profile pages | ❌ No | ❌ No | Low priority (auth pages) |

### 5.2 Critical SEO Issues

#### BUG #24 — Wrong domain in canonical URLs (CRITICAL)
Three pages use `hidelifestyle.co.uk` instead of `iconperfumes.in`:

| File | Line | Current Value |
|------|------|---------------|
| `shop/page.js` | 9 | `https://www.hidelifestyle.co.uk/shop/` |
| `blogs/page.js` | 9 | `https://www.hidelifestyle.co.uk/blogs/` |
| `blogs/[title]/page.js` | 22 | `https://www.hidelifestyle.co.uk/blogs/${...}` |

**Severity:** Critical  
**Fix:** Replace all instances of `hidelifestyle.co.uk` with `iconperfumes.in`.

---

#### BUG #25 — Blog posts set to `noindex, nofollow` (CRITICAL)
**File:** `src/app/(home)/blogs/[title]/page.js` — Line 15

```javascript
robots: {
    index: false,
    follow: false,
}
```

ALL blog posts are hidden from search engines. This is almost certainly a mistake carried over from development.

**Severity:** Critical  
**Fix:** Change to `{ index: true, follow: true }`.

---

#### BUG #26 — No Open Graph tags anywhere (HIGH)

No page in the entire codebase sets `openGraph` or `twitter` properties in metadata. When product pages are shared on social media (Facebook, Twitter, WhatsApp), they will have no preview image, no custom title, and no description.

```javascript
// Missing from all generateMetadata() functions:
openGraph: {
    title: product.meta_title,
    description: product.meta_description,
    images: [{ url: product.images[0] }],
    type: 'product',
},
twitter: {
    card: 'summary_large_image',
    title: product.meta_title,
    description: product.meta_description,
    images: [product.images[0]],
},
```

**Severity:** High  
**Fix:** Add `openGraph` and `twitter` to `generateMetadata()` in `[...slug]/page.js`, `blogs/[title]/page.js`, and `page.js`.

---

#### BUG #27 — No JSON-LD structured data (HIGH)

No Product, BreadcrumbList, Organization, or any other JSON-LD structured data exists. Google cannot generate rich snippets (price, availability, reviews, ratings) for product pages.

**Severity:** High  
**Fix:** Add JSON-LD scripts to product detail pages:

```javascript
<script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images,
        description: product.meta_description,
        offers: {
            "@type": "Offer",
            price: product.discounted_price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
        }
    })
}} />
```

---

#### BUG #28 — Empty string fallback for meta titles (MEDIUM)
**File:** `src/app/(home)/[...slug]/page.js` — Line 57

```javascript
title: data?.variants[0]?.meta_title || ""  // ❌ Empty title is worse for SEO
```

If `meta_title` is null, the page title becomes empty, which is a negative SEO signal.

**Severity:** Medium  
**Fix:** Use brand name as fallback: `|| "Icon Perfumes"`

---

#### BUG #29 — Sitemap only includes categories dynamically (MEDIUM)
**File:** `next-sitemap.config.js`

`additionalPaths` only generates category URLs. Product URLs come from a manually-generated static `sitemap.xml` file. New products won't be included unless the static file is regenerated.

**Severity:** Medium  
**Fix:** Add product URL generation to `additionalPaths`:
```javascript
const productsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
// Generate URLs for each product variant
```

---

### 5.3 Additional SEO Elements

| Element | Status |
|---------|--------|
| `robots.txt` | ✅ Correct — allows all, includes sitemap URL |
| Google verification | ✅ Set in `metadata.verification.google` |
| Canonical URLs | ⚠️ Set on most pages but wrong domain on 3 pages |
| `trailingSlash` | ✅ Enabled in next.config.mjs |
| `sitemap.xml` | ⚠️ Static file — not auto-generated for products |

---

## 6. Security Concerns

| # | Issue | File | Severity |
|---|-------|------|----------|
| S1 | Auth token logged via `console.log(token)` | `middleware.js:10` | **Critical** |
| S2 | Token passed as URL query parameter (visible in browser history, server logs, referer headers) | `Payment.js:68`, `PaymentSuccess.js:63` | **High** |
| S3 | Encryption secret defaults to `'default_secret_key'` if env var missing | `cartSlice.js:15`, `wishListSlice.js:15` | **High** |
| S4 | `COOKIE_SECRET` uses `process.env.COOKIE_SECRET` (not `NEXT_PUBLIC_` prefix) — will be undefined on client | `cartSlice.js:15` | **High** |
| S5 | Multiple env vars exposed via `next.config.mjs:env` that should stay server-side (PAYMENT_SECRET, COOKIE_SECRET, STRIPE_KEY) | `next.config.mjs:17-23` | **High** |
| S6 | `class="loader"` instead of `className` in Suspense fallbacks — potential XSS vector in strict configurations | Various | **Low** |

---

## 7. Full Issue Tracker

### Critical (12)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | `deleteUser` thunk has 5 bugs (useRouter in thunk, wrong args, missing await, undefined vars) | `userSlice.js:37-56` | Rewrite entire thunk |
| 2 | Non-serializable `resolve` function stored in Redux state | `modalSlice.js:22` | Use event emitter pattern |
| 6 | PaymentSuccess crashes on null sessionStorage data | `PaymentSuccess.js:60` | Add null guard |
| 7 | Product detail crashes on API failure (3-slug path) | `[...slug]/page.js:343-348` | Add `if (!data) return notFound()` |
| 17 | `next/head` used in App Router — silently ignored | `layout.js:16,89` | Remove `<Head>` block |
| 19 | Razorpay Node.js SDK imported in client component | `Checkout.js:26` | Remove import |
| 20 | Auth token logged in middleware | `middleware.js:10` | Remove `console.log` |
| 24 | Wrong domain (`hidelifestyle.co.uk`) in canonical URLs | 3 files | Replace with `iconperfumes.in` |
| 25 | Blog posts set to `noindex, nofollow` | `blogs/[title]/page.js:15` | Change to `true` |
| S3 | Encryption uses `'default_secret_key'` fallback | `cartSlice.js:15` | Ensure env var is set |
| S4 | `COOKIE_SECRET` not accessible on client (wrong env prefix) | `cartSlice.js:15` | Use `NEXT_PUBLIC_COOKIE_SECRET` |
| S5 | Server-side secrets exposed via `next.config.mjs:env` | `next.config.mjs:17-23` | Remove PAYMENT_SECRET, COOKIE_SECRET, STRIPE_KEY from env config |

### High (18)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 3 | `addAddress` catch references out-of-scope `json` | `userSlice.js:101` | Change to `error.message` |
| 8 | Address detail page crashes on null API response | `addresses/[id]/page.js:47` | Add null check |
| 9 | OrderId.js references undefined `error` variable | `OrderId.js:131` | Remove or declare `error` |
| 10 | Payment POST missing Content-Type header | `Payment.js:67-70` | Add `Content-Type: application/json` |
| 12 | Swiper Navigation/Autoplay modules not imported in Navbar | `Navbar1.js:168` | Import `Navigation, Autoplay` from swiper |
| 15 | Middleware API call is dead code (result never used) | `middleware.js:34-41` | Remove or use the response |
| 21 | No `loading.js` files in entire app | — | Create loading files |
| 26 | No Open Graph or Twitter tags on any page | All pages | Add OG tags to `generateMetadata` |
| 27 | No JSON-LD structured data for products | Product pages | Add structured data scripts |
| S2 | Token passed in URL query parameters | `Payment.js:68`, `PaymentSuccess.js:63` | Use cookie-based auth instead |
| — | 11 unused npm packages in `package.json` | `package.json` | `npm uninstall` all unused |
| — | Full Bootstrap CSS alongside Tailwind (~190KB redundant) | `layout.js:2` | Migrate to Tailwind-only |
| — | 70 `console.log` statements in production | Various | Remove all |
| — | `fetchUser` returns null on error but marks status as 'succeeded' | `userSlice.js:122` | Use `rejectWithValue` instead |
| — | `restricted`/`not_restricted` arrays defined but never used in middleware | `middleware.js:14-15` | Implement or remove |
| — | Unused Stripe import in Checkout | `Checkout.js:22` | Remove import |
| — | Backend profile API doesn't return `is_staff` | Backend issue | Add `is_staff` to response |
| — | `Profile.js` console.log typo `"user".user` | `Profile.js:38` | Fix to `console.log("user", user)` |

### Medium (22)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 4 | Guest cart/wishlist cleared before OTP verification | `SignUp.js:70-71` | Move after OTP success |
| 5 | Login validation error never displays (`errors.email` vs `errors.contact`) | `Login.js:141-143` | Change to `errors.contact` |
| 11 | OTP resend missing Content-Type and credentials | `OTP.js:78-80` | Add headers |
| 12b | ResetPassword catch uses `JSON.message` | `ResetPassword.js:47` | Change to `error.message` |
| 13 | Contact form network error is silent | `Contact.js:48` | Add toast |
| 14 | Detail.js error state set but never rendered | `Detail.js` | Render `myError` in JSX |
| 16 | `Math.random()` in SSR component causes hydration mismatch | `sidebar.jsx:529` | Use deterministic value |
| 22 | Skeleton component exists but unused on any page | `skeleton.jsx` | Apply to Shop, Detail pages |
| 23 | `class` instead of `className` in JSX | 4 locations | Replace with `className` |
| 28 | Empty string fallback for meta titles | `[...slug]/page.js:57` | Use "Icon Perfumes" |
| 29 | Sitemap only includes categories, not products | `next-sitemap.config.js` | Add product URLs |
| — | `raw <img>` tags instead of `next/image` | 2 locations | Use `<Image>` |
| — | 9 images with empty `alt=""` | 6 files | Add descriptive alt text |
| — | Product2.js missing `alt` prop entirely | `Product2.js:45` | Add `alt` prop |
| — | Inconsistent CSS breakpoints (769 vs 768, etc.) | Various CSS modules | Standardize breakpoints |
| — | Cookie consent check only in Login, not SignUp | `Login.js` vs `SignUp.js` | Add to SignUp |
| — | Premature "Account Created" toast before OTP verification | `SignUp.js:72-73` | Move after OTP success |
| — | OTP errors display may fail (array vs object) | `OTP.js:155` | Check array structure |
| — | ReviewForm submit error is console-only | `ReviewForm.js:48` | Add toast |
| — | AddressDetail onSubmit catch is console-only | `AddressDetail.js:104` | Add toast |
| — | Shop page has no title/description metadata | `shop/page.js` | Add metadata |
| — | Order confirm page uses wrong domain | Order confirm metadata | Fix domain |

### Low (10)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 18 | `Welcome.js` missing `'use client'` directive | `Welcome.js:1` | Add directive |
| — | `ToastContainer.js` uses array index as React key | `ToastContainer.js:14` | Use `toast.id` |
| — | Unused imports (Cookies, router) in OTP.js | `OTP.js:12,21-22` | Remove |
| — | Unused destructured variables in SignUp.js | `SignUp.js:36` | Remove |
| — | `pathname` missing from RedirectHandler useEffect deps | `RedirectHandler.js:15` | Add to deps |
| — | `sign-up/page.js` uses `class` instead of `className` | `sign-up/page.js:19` | Fix attribute |
| — | Redundant `typeof window` checks inside `useEffect` | `PaymentSuccess.js:41`, `Payment.js:44` | Remove checks |
| — | Cookie expiry computed at module load time | `cookieSlice.js:10-11` | Move to runtime |
| — | `fetchBanners()` inconsistent error return shape | `page.js` | Standardize |
| — | `PaymentSuccess.js` URL has malformed `?&token=` | `PaymentSuccess.js:63` | Fix to `?token=` |

---

## Quick Wins (Can Fix in < 1 Hour)

1. **Remove 11 unused npm packages** — `npm uninstall razorpay @stripe/stripe-js jquery fs crypto icons icones nextjs photoviewer react-owl-carousel`
2. **Remove `console.log(token)` from middleware.js** — security fix
3. **Fix canonical URLs** — find/replace `hidelifestyle.co.uk` → `iconperfumes.in`
4. **Fix blog `noindex`** — change `{ index: false, follow: false }` to `{ index: true, follow: true }`
5. **Remove `import Head from 'next/head'`** — dead code in App Router
6. **Fix `errors.email` → `errors.contact`** in Login.js
7. **Fix `JSON.message` → `error.message`** in ResetPassword.js
8. **Fix `json.message` → `error.message`** in userSlice.js addAddress catch
9. **Remove Razorpay and Stripe imports** from Checkout.js
10. **Add `className` instead of `class`** in Suspense fallbacks

---

*Report generated by automated frontend audit. All line numbers reference the codebase as of March 3, 2026.*
