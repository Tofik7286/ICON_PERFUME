# ICON Perfume EC2 Deployment Guide (Hinglish - Pure Markdown)

Yeh guide first-time setup aur repeat deployment updates ke liye hai ICON Perfume stack ko Ubuntu EC2 par deploy karne ke liye.

---

## Step 0: AWS Pre-check

- Security Group inbound rules allow hone chahiye:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
- Agar aap domain use kar rahe ho, to apne domain ka A record EC2 public IP par point karo.

---

## Step 1: EC2 se Connect

Apne local system se SSH ke through EC2 instance par connect karo using your key file aur public IP.

---

## Step 2: Base Packages Install

System update aur upgrade karo, phir required packages install karo jaise:
- git
- curl
- build tools
- Python related packages
- PostgreSQL database
- Redis server
- RabbitMQ server
- Nginx

Uske baad in services ko enable aur start karo:
- PostgreSQL
- Redis
- RabbitMQ
- Nginx

---

## Step 3: Node.js aur PM2 Setup

- Node.js (preferably version 20 LTS) install karo
- PM2 globally install karo process manager ke liye

---

## Step 4: Project Setup

- `/var/www` directory create karo
- Uska ownership ubuntu user ko de do
- Project repository clone karo GitHub se
- Main branch checkout karo aur latest code pull karo

---

## Step 5: Database Setup (PostgreSQL)

- PostgreSQL shell open karo
- Naya database create karo: `icon_perfumes_local`
- Naya user create karo: `icon_perfumes`
- User ko database par full privileges de do

⚠️ Production ke liye strong password use karo.

---

## Step 6: Backend Setup

- Backend folder me jao
- Python virtual environment create aur activate karo
- Required Python packages install karo (requirements file se)
- Gunicorn install karo

### Logging Setup

- `logs` folder create karo
- `admin.log` aur `error.log` files create karo

### Environment Configuration

Backend ke liye `.env` file create karo jisme ye values honi chahiye:
- DEBUG mode
- Secret keys
- Allowed hosts aur origins
- URLs (web, media)
- Logging file paths
- Email config (optional)
- Payment gateway keys (Razorpay, PayU, etc.)
- Redis password (optional)

⚠️ Logging file paths dena mandatory hai, warna backend start nahi hoga.

---

## Step 7: Django Setup

- Database migrations run karo
- Static files collect karo
- Admin user (superuser) create karo

(Optional)
- Agar aapke paas existing data hai to usko import bhi kar sakte ho

---

## Step 8: Frontend Setup

- Frontend folder me jao
- Dependencies install karo
- `.env.production` file create karo

### Required Configuration

- API URL
- Backend URL
- Image URL
- Domain
- Secrets
- Environment (production)

### Build and Run

- Frontend build karo
- PM2 ke through app start karo
- PM2 ko save aur startup enable karo taki reboot ke baad bhi chale

---

## Step 9: Gunicorn Service Setup

- Systemd service file create karo Gunicorn ke liye

### Configuration me include karo:
- Working directory (backend path)
- Virtual environment path
- Gunicorn start command
- Workers count aur timeout
- Auto restart enabled

- Service reload karo aur enable + start karo

---

## Step 10: Celery Worker Setup

- Systemd service file create karo Celery worker ke liye

### Configuration me include karo:
- Backend directory
- Virtual environment path
- Celery app reference
- Logging level
- Auto restart

- Service reload karo aur enable + start karo

---

## Step 11: Nginx Reverse Proxy Setup

- Nginx configuration file create karo

### Configuration me include karo:

- Server name (domain + EC2 IP)
- Static files ka path
- Media files ka path

### Routing:

- `/api/` → backend (Gunicorn)
- `/admin/` → backend
- `/` → frontend (PM2 app)

- Configuration enable karo
- Default config remove karo
- Nginx test karo aur restart karo

---

## Step 12: SSL Setup

- Certbot install karo
- Nginx ke through SSL certificate generate karo
- Auto-renewal enable karo

---

## Step 13: Final Health Checks

Check karo ki sab services sahi chal rahi hain:

- Gunicorn status
- Celery status
- Nginx status
- PM2 status

### Test endpoints:

- Frontend local port
- Backend API endpoint
- Public IP access

---

# 🔁 Deployment Update Flow (Har Update ke baad)

## 1. Latest Code Pull

- Project directory me jao
- Latest code pull karo main branch se

---

## 2. Backend Update

- Virtual environment activate karo
- Dependencies update/install karo
- Database migrations run karo
- Gunicorn aur Celery restart karo

---

## 3. Frontend Update

- Dependencies reinstall karo
- Frontend rebuild karo
- PM2 process restart karo

---

## 4. Nginx Reload

- Configuration test karo
- Nginx reload karo

---

## Optional (Recommended)

Aap automation ke liye scripts bana sakte ho:

- `setup-ec2.sh` → first-time complete setup ke liye
- `deploy-update.sh` → code pull + restart ke liye