# ICON_PERFUME Deployment + Migration Handoff Summary (2026-03-26)

## Goal
Local project (SQLite data) ko EC2 production par run karna tha with:
- Django backend (Gunicorn + Nginx + PostgreSQL)
- Next.js frontend (PM2)
- Existing local DB data migrate to server PostgreSQL

---

## High-Level Outcome
Deployment stack mostly working state me aa gaya:
- Frontend build successful
- PM2 process running
- Gunicorn service running
- Nginx running and serving public IP
- SQLite -> PostgreSQL data migration completed via Django fixture import
- Sequences reset completed

Aakhri phase me final service restart + API/UI verification pending/required.

---

## What Was Done (Chronological)

### 1) Disk/Infra Recovery (EC2)
- Root volume full issue face hua (ENOSPC errors).
- Extra EBS volume attach + mount at `/data`.
- Project moved to `/data/icon/ICON_PERFUME` and symlinked from `/home/ubuntu/ICON_PERFUME`.
- Root disk usage significantly drop hua.

### 2) Backend Setup
- Django migrations run hui (no pending schema migration).
- Gunicorn systemd service file created: `icon-gunicorn.service`.
- Service enabled + started; status showed active (running) with workers.

### 3) Frontend Setup
- Next.js build pe pehle timeout + API reachability issues aaye.
- Build eventually successful with warnings only (lint warnings non-blocking).
- PM2 process `icon-frontend` created, restarted, saved, startup configured.

### 4) Nginx Setup
- Custom site config create hua (`icon-perfume`).
- `server_names_hash_bucket_size` issue aaya; fixed in `nginx.conf` (set to 128).
- Nginx syntax test successful and service restarted.
- Default nginx welcome page issue resolve kiya by:
  - removing default enabled site
  - enabling `icon-perfume` site

### 5) Public IP + API Connectivity Fixes
- Public IP switched to `65.1.1.88`.
- Backend `ALLOWED_HOSTS` me `65.1.1.88` add kiya.
- Frontend `.env.production` me `NEXT_PUBLIC_API_URL` update kiya to public API URL.
- `401 /api/profile/` observed: expected for unauthenticated request.

### 6) SQLite -> PostgreSQL Data Migration
- Local dump attempt initially failed due Windows encoding (`charmap`).
- Fixed by setting `PYTHONUTF8=1` and using `--output`.
- Dump transfer to EC2 via `scp -i ...pem`.
- Initial `loaddata` failed due `admin.logentry` + missing historical model/contenttype reference.
- New clean dump generated excluding `admin.logentry`.
- Clean fixture imported successfully:
  - `Installed 904 object(s) from 1 fixture(s)`
- Sequence reset executed through `sqlsequencereset ... | dbshell` and committed.

---

## Important Commands Used

### Local (Windows) dump/export
```powershell
$env:PYTHONUTF8='1'; python manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission --exclude admin.logentry --output db_full_dump_clean.json
```

### Local to EC2 transfer
```powershell
scp -i "C:\Users\Mohammad Tofik\Desktop\ICON_PERFUME\icon-perfume.pem" -o StrictHostKeyChecking=accept-new db_full_dump_clean.json ubuntu@65.1.1.88:/home/ubuntu/ICON_PERFUME/backend/
```

### EC2 import
```bash
cd /home/ubuntu/ICON_PERFUME/backend
source venv/bin/activate
python manage.py loaddata db_full_dump_clean.json
python manage.py sqlsequencereset accounts mainapp auth admin sessions | python manage.py dbshell
```

---

## Current Runtime Snapshot (From chat logs)
- `icon-gunicorn.service`: active (running)
- `nginx.service`: active (running)
- `icon-frontend` PM2 process: online
- Public URL responding (`HTTP 200`) and now serving app stack (not just default nginx page after fixes)

---

## Pending Final Verification (Run These Now)

### 1) Restart backend/frontend once after migration
```bash
sudo systemctl restart icon-gunicorn
pm2 restart icon-frontend --update-env
pm2 save
```

### 2) Verify service health
```bash
sudo systemctl status icon-gunicorn --no-pager -l
sudo systemctl status nginx --no-pager -l
pm2 status
pm2 logs icon-frontend --lines 50
```

### 3) Verify endpoints
```bash
curl -I http://65.1.1.88
curl -i http://65.1.1.88/api/categories/
curl -I http://65.1.1.88/admin/
```

### 4) Browser check
- Open: `http://65.1.1.88`
- Hard refresh: `Ctrl + Shift + R`
- Validate categories/products render (depends on migrated data + business logic filters).

---

## Notes About Responses Seen
- `401` on `/api/profile/`: normal if user not logged in.
- `405` from `curl -I` on some API routes: normal if endpoint doesn’t allow HEAD.
- Next lint warnings (`useEffect dependencies`, `<img>`): non-blocking for build/deploy.

---

## Known Risk / Security Action Required
Sensitive private key was exposed in chat content.
- Action required: rotate/revoke current EC2 key pair and replace with a new key.

---

## If Anything Breaks, Run This Diagnostic Bundle
```bash
df -h
lsblk
pm2 status
pm2 logs icon-frontend --lines 80
sudo systemctl status icon-gunicorn --no-pager -l
sudo systemctl status nginx --no-pager -l
curl -i http://127.0.0.1:8000/api/categories/
curl -i http://65.1.1.88/api/categories/
```

---

## One-Line Continuation Prompt for New Chat
"Use `CHAT_CONTINUATION_SUMMARY_2026-03-26.md` as source of truth. Continue from final verification stage after SQLite->PostgreSQL import and sequence reset."
