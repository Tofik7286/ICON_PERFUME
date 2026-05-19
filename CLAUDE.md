# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ICON_PERFUME is an e-commerce platform for perfume products at iconperfumes.in. It's a full-stack application with:
- **Frontend**: Next.js 15 with React 18, Redux Toolkit, Tailwind CSS
- **Backend**: Django 5.1 with Django REST Framework
- **Payment Gateway**: PayU integration (primary); Stripe and PineLabs configured but not active
- **Database**: PostgreSQL (production), SQLite (local development)
- **Background Tasks**: Celery + Redis for async email/task queue
- **Admin Interface**: Jazzmin (Django admin customization)

## Development Commands

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
npm run build
npm start
npm run lint
```

### Backend
```bash
cd backend
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # Linux/Mac

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver       # http://localhost:8000
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

See `DEPLOY_COMMANDS.md` for production deployment (PM2, Gunicorn, Nginx).

## Architecture

### Frontend (Next.js 15 App Router)

**Routing layout**: All user-facing pages live under `src/app/(home)/` as a route group. Key routes:
- `/` — Home (best sellers, banners, categories)
- `/shop` — Product listing with filters
- `/[...slug]` — Dynamic product detail pages
- `/checkout` — Cart review, address, payment initiation
- `/payment` — PayU redirect and result handling
- `/profile` — User account, addresses, order history

**Redux state** (`src/app/(home)/redux/`): Slices for `user`, `cart`, `wishlist`, `checkout`, `modal`, `loader`, `toasts`, `products`. Redux is the source of truth for auth tokens, cart, and all UI state (modals, toasts).

**API calls**: Axios instance in `src/lib/` targets `NEXT_PUBLIC_API_URL`. JWT Bearer tokens sent in `Authorization` header.

**Styling**: Tailwind CSS (primary) with HSL-based custom color tokens in `tailwind.config.js`. Bootstrap 5.3.3 included but Tailwind takes precedence. Radix UI for accessible component primitives.

**Image optimization**: Next.js `<Image>` with multi-domain whitelist (local, production, AWS). AVIF/WebP formats, 1-year cache TTL, minimal buffer pages.

### Backend (Django 5.1)

**Apps**:
- `mainapp` — Products, cart, orders, checkout, wishlist, reviews
- `accounts` — Custom user model (phone-based), JWT auth, OTP

**Authentication**: Phone is the unique identifier for `CustomUser`. OTP used for phone/email verification. JWT tokens with 30-day expiry via `djangorestframework-simplejwt`. Password reset via email + token link.

**Core models** (`mainapp/models.py`):
- `Product` / `ProductVariant` — Products have size/concentration variants; slugs auto-generated
- `ProductCategory` — MPTT tree for hierarchical categories
- `Cart` — User's active cart (not order history)
- `Order` / `OrderItem` — Order metadata + individual line items
- `Transaction` / `PaymentSession` — PayU payment records
- `Wishlist`, `Notes` (fragrance notes), `ProductSeries`

**API structure**: All endpoints under `/api/` routed through `mainapp/urls.py`. Views split by domain in `mainapp/views/` (`products.py`, `cart.py`, `checkout.py`, `orders.py`, `reviews.py`, `wishlist.py`, `buynow.py`). Responses use custom wrappers `success_response` / `error_response` from `mainapp/responses.py`.

**PayU payment flow**:
1. Frontend POSTs to `/api/checkout-total/` → calculates totals (shipping Rs. 45, free above Rs. 499)
2. Frontend POSTs to `/api/initiate-payment/` (`checkout.py`) → generates SHA-512 hash → returns PayU form params
3. User redirected to PayU gateway
4. PayU POSTs back to `/api/verify-payment/` (webhook) → server-side verification via PayU verify API → updates `Transaction.order.payment_status = "Paid"` → Celery triggers order confirmation email

**Email**: Gmail SMTP + Celery async tasks. Templates in `templates/emails/`.

**Admin**: Jazzmin (theme: "united") with nested-admin for inline editing. Dashboard customized in `mainapp/dashboard.py`. Import/export available for bulk data.

**Logging**: `logs/admin.log` (info) and `logs/temp.log` (errors). Payment transactions logged in `checkout.py` with PayU `txnid`.

## Environment Variables

### Frontend (`frontend/.env.local` / `frontend/.env.production`)
```
NEXT_PUBLIC_API_URL=<backend_base_url>   # e.g., http://localhost:8000/api
```

### Backend (`backend/.env` / `backend/.env.local` / `backend/.env.production`)
| Variable | Purpose |
|---|---|
| `DJANGO_ENV` | `"local"`, `"development"`, or `"production"` — controls SSL, debug, DB |
| `SECRET_KEY` | Django secret |
| `JWT_SECRET_KEY` | JWT signing key |
| `DATABASE_URL` | PostgreSQL connection string |
| `ALLOWED_HOSTS` | Comma-separated domain list |
| `ALLOWED_ORIGINS` | CORS origins (frontend URL) |
| `WEB_URL` | Frontend base URL |
| `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, `PAYU_BASE_URL` | PayU credentials |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | Gmail SMTP |

## Key Patterns & Gotchas

**PayU hashing**: Uses SHA-512 (not SHA-1/MD5). Hash generation in `mainapp/views/checkout.py`. Payment verification is server-side — never trust client-reported payment status.

**CORS**: `CORS_ALLOW_CREDENTIALS = True`. Whitelist in `ALLOWED_ORIGINS`. Allowed methods: GET, POST, PUT, PATCH, DELETE.

**Production stack**: Frontend via PM2, backend via Gunicorn, Nginx as reverse proxy with SSL termination. Server root: `/var/www/ICON_PERFUME/`.

**Migrations**: Always run `makemigrations` + `migrate` locally before deploying; test migrations before production.

**Adding a backend feature**: model → migration → admin registration → serializer → view in `views/<feature>.py` → URL in `mainapp/urls.py`.

**Frontend feature**: page/component in `src/app/(home)/<feature>/` + API wrapper in `src/lib/` + Redux slice if new state needed.
