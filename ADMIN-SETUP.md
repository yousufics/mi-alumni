# অ্যাডমিন প্যানেল সেটআপ (প্রজেক্ট ফোল্ডারে চালান)

```
cd /d E:\laragon\www\MI-Alumni\mi-alumni
powershell -Command "Expand-Archive -Path mi-alumni-admin.zip -DestinationPath . -Force"
php artisan migrate
php artisan db:seed --class=SiteContentSeeder
php artisan admin:create আপনার@ইমেইল.com --name="আপনার নাম"
php artisan config:clear
```
(`admin:create` পাসওয়ার্ড চাইবে, কমপক্ষে ৮ অক্ষর।)

তারপর `npm run dev` ও `php artisan serve` চালিয়ে খুলুন: http://127.0.0.1:8000/admin/login

টেস্ট: `php artisan test`
