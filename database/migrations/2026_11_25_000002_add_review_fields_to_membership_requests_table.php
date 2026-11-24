<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->string('status', 20)->default('pending')->index()->after('message');
            $table->timestamp('reviewed_at')->nullable()->after('status');
            $table->text('admin_note')->nullable()->after('reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->dropColumn(['status', 'reviewed_at', 'admin_note']);
        });
    }
};
