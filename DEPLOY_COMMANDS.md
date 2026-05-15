# Deploy & Dev Commands

## Local Development

### Backend (Django)
```
cd C:\Users\Mohammad Tofik\Desktop\ICON_PERFUME\backend
.\venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend (Next.js)
```
cd C:\Users\Mohammad Tofik\Desktop\ICON_PERFUME\frontend
npm install
npm run dev
```

## Local Git Commit + Push
```
cd C:\Users\Mohammad Tofik\Desktop\ICON_PERFUME
git status
git add <files>
git commit -m "your message"
git push origin main
```

Note: For paths with parentheses, use quotes:
```
git add "frontend/src/app/(home)/layout.js"
```

## Server Production - Frontend
```
cd /var/www/ICON_PERFUME
git pull origin main

cd /var/www/ICON_PERFUME/frontend
rm -rf .next
npm install
npm run build
pm2 restart icon-perfumes-frontend --update-env
pm2 logs icon-perfumes-frontend --lines 50
```

## Server Production - Backend
```
cd /var/www/ICON_PERFUME
git pull origin main

cd /var/www/ICON_PERFUME/backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

sudo systemctl restart gunicorn
sudo systemctl restart nginx
```
