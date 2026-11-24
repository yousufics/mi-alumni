<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('committee_members', function (Blueprint $table) {
            $table->string('position', 40)->default('member')->index()->after('id');
            $table->string('photo')->nullable()->after('batch');
            $table->string('session', 60)->nullable()->change();
        });

        // আগের role লেখা থেকে পজিশন বসানো
        $map = [
            'প্রধান উপদেষ্টা' => 'chief_advisor',
            'সভাপতি' => 'president',
            'সাধারণ সম্পাদক' => 'general_secretary',
            'সহ-সভাপতি' => 'vice_president',
            'যুগ্ম সাধারণ সম্পাদক' => 'joint_secretary',
            'সহ-সাধারণ সম্পাদক' => 'joint_secretary',
        ];
        foreach ($map as $role => $position) {
            DB::table('committee_members')->where('role', $role)->update(['position' => $position]);
        }
    }

    public function down(): void
    {
        Schema::table('committee_members', function (Blueprint $table) {
            $table->dropColumn(['position', 'photo']);
        });
    }
};
