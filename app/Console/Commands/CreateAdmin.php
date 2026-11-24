<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create {email : অ্যাডমিনের ইমেইল} {--name=Admin : নাম}';

    protected $description = 'অ্যাডমিন ব্যবহারকারী তৈরি বা পাসওয়ার্ড রিসেট করে';

    public function handle(): int
    {
        $email = $this->argument('email');

        $password = $this->secret('পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)');
        if (strlen((string) $password) < 8) {
            $this->error('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');

            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => $this->option('name'),
            'password' => Hash::make($password),
            'is_admin' => true,
        ])->save();

        $this->info("অ্যাডমিন তৈরি হয়েছে: {$email}। লগইন: /admin/login");

        return self::SUCCESS;
    }
}
